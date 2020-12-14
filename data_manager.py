"""Because of the restriction of API (100 requests/day, 50 requests/12 hours),
the program saves the json datas into database. If more than one user selects
the same country and news agency on the same day,
the second, third etc. selection will be served from database,
only the first will be served with API request.
Headlines for the scrolling area are handled in the same way."""

import configparser
import requests
import datetime
import json
import psycopg2
import os
from operator import itemgetter

config = configparser.ConfigParser()
config.read('app.ini')
actual_api_key = config['newsapi.org']['api_key_1']
number_of_api_keys = 5

def database_connection():
    cursor = ''
    conn = ''
    
    # Heroku:
    if 'DYNO' in os.environ:
        urllib.parse.uses_netloc.append('postgres')
        url = urllib.parse.urlparse(os.environ.get('DATABASE_URL'))
        database=url.path[1:],
        user=url.username,
        password=url.password,
        host=url.hostname,
        port=url.port
        connect_str = "dbname=" + database + " user=" + user + " host=" + host + " password=" + password + " port=" + port
    # Localhost:
    else:
        dbname = config['db_connection']['dbname']
        user = config['db_connection']['user']
        host = config['db_connection']['host']
        password = config['db_connection']['password']
        connect_str = "dbname=" + dbname + " user=" + user + " host=" + host + " password=" + password
    try:
        conn = psycopg2.connect(connect_str)
        conn.autocommit = True
        cursor = conn.cursor()
    except Exception as e:
        print("There is no connection. Invalid dbname, user or password? Please, check it.")
        print(e)
    return cursor, conn

def query_result(*query):
    try:
        cursor, conn = database_connection()
        cursor.execute(*query)
        rows = cursor.fetchall()
        rows = [list(row) for row in rows]
    except AttributeError as e:
        print('There is no database connection.')
        rows = ""
    except psycopg2.OperationalError as e:
        print('OperationalError')
        print(e)
        rows = ""
    except psycopg2.ProgrammingError as e:
        print("Nothing to print")
        print(e)
        rows = ""
    except psycopg2.IntegrityError as e:
        print('IntegrityError')
        print(e)
        rows = ""
        raise e from query_result()
    finally:
        if conn:
            conn.close()
    return rows

def get_json_from_API(url):
    data_from_api = []
    status = 'api calling failed'
    try:
        data_from_api = requests.get(url).json()
        status = data_from_api['status']
    except ValueError as value_err:
        print('JSON decoding fails: ' + str(value_err))
    except Exception as ex:
        print('Error during request datas from News API: ' + str(ex))
    return status, data_from_api

def get_articles(country_name, news_agency):
    sorted_list_of_articles_without_duplicates = []
    succeeded, article_package = article_request_handler(country_name, news_agency)
    if (succeeded == True) and (len(article_package) > 0):
        articles = article_package['articles']

        # Sorting articles by publishing date:
        sorted_list_of_articles = sorted(articles, key=itemgetter('publishedAt'), reverse=True)

        # Delete recurring articles from list:
        titles = set()
        for article in sorted_list_of_articles:
            if article['title'].split(' - ')[0] not in titles:
                titles.add(article['title'].split(' - ')[0])
                sorted_list_of_articles_without_duplicates.append(article)
    return succeeded, sorted_list_of_articles_without_duplicates

def get_top_headlines(news_agency):
    succeeded, headline_package = top_headline_request_handler(news_agency)
    return succeeded, headline_package

def article_request_handler(country_name, news_agency):
    succeeded = False
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    json_data = get_current_article_json_from_database(country_name, news_agency, current_date)
    if len(json_data) == 0:
        for api_key_num in range(number_of_api_keys):
            url = 'https://newsapi.org/v2/everything?q="' + country_name + \
            '"&sources=' + news_agency + \
            '&sortBy=relevancy&apiKey=' + actual_api_key
            status, json_data = get_json_from_API(url)
            if status == "ok":
                succeeded = True
                break
            elif status == "error":
                message = json_data['message']
                print('News API responded, but error occured. Message: ' + message)
                change_api_key()
        if len(json_data) != 0:
            put_article_json_to_database(country_name, news_agency, json_data, current_date)
    elif len(json_data) > 0:
        succeeded = True
    return succeeded, json_data

def top_headline_request_handler(news_agency):
    succeeded = False
    top_headlines = []
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    json_data = get_current_headline_json_from_database(news_agency, current_date)
    
    if len(json_data) == 0:
        for api_key_num in range(number_of_api_keys):
            url = 'https://newsapi.org/v2/top-headlines?sources=' + news_agency + \
            '&apiKey=' + actual_api_key
            status, json_data = get_json_from_API(url)
            if status == "ok":
                succeeded = True
                break
            elif status == "error":
                message = json_data['message']
                print('News API responded, but error occured. Message: ' + message)
                change_api_key()
        if len(json_data) != 0:
            put_headline_json_to_database(news_agency, json_data, current_date)
    elif len(json_data) > 0:
        succeeded = True

    if len(json_data) > 0:
        articles = json_data['articles']
        for article in articles:
            top_headlines.append(article['title'])
    
    return succeeded, top_headlines

def get_current_article_json_from_database(country_name, news_agency, current_date):
    current_json = []
    current_json = query_result("SELECT json_data FROM article_jsons WHERE country_name = %s AND news_agency = %s AND last_storage_date = %s;", 
                                (country_name, news_agency, current_date))
    if len(current_json) > 0:
        return current_json[0][0]
    return current_json

def put_article_json_to_database(country_name, news_agency, json_data, current_date):
    if is_country_with_news_agency_in_db(country_name, news_agency) == True:
        query_result("UPDATE article_jsons " +
                    "SET json_data = %s, last_storage_date = %s " + 
                    "WHERE country_name = %s AND news_agency = %s returning country_name;", 
                    (json.dumps(json_data), current_date, country_name, news_agency))
    else:
        query_result("INSERT INTO article_jsons (country_name, news_agency, json_data, last_storage_date) " +
                    "VALUES (%s, %s, %s, %s) returning country_name;", (country_name, news_agency, json.dumps(json_data), current_date))

def is_country_with_news_agency_in_db(country_name, news_agency):
    json_data = []
    json_data = query_result("SELECT json_data FROM article_jsons " + 
                            "WHERE country_name = %s AND news_agency = %s;", (country_name, news_agency))
    if len(json_data) > 0:
        return True
    return False

def get_current_headline_json_from_database(news_agency, current_date):
    current_json = []
    current_json = query_result("SELECT json_data FROM headline_jsons WHERE news_agency = %s AND last_storage_date = %s;", 
                                (news_agency, current_date))
    if len(current_json) > 0:
        return current_json[0][0]
    return current_json

def put_headline_json_to_database(news_agency, json_data, current_date):
    if is_headline_in_db(news_agency) == True:
        query_result("UPDATE headline_jsons " +
                    "SET json_data = %s, last_storage_date = %s " + 
                    "WHERE news_agency = %s returning news_agency;", 
                    (json.dumps(json_data), current_date, news_agency))
    else:
        query_result("INSERT INTO headline_jsons (news_agency, json_data, last_storage_date) " +
                    "VALUES (%s, %s, %s) returning news_agency;", (news_agency, json.dumps(json_data), current_date))

def is_headline_in_db(news_agency):
    json_data = []
    json_data = query_result("SELECT json_data FROM headline_jsons WHERE news_agency = %s;", (news_agency,))
    if len(json_data) > 0:
        return True
    return False

def change_api_key():
    global actual_api_key
    if actual_api_key == config['newsapi.org']['api_key_1']:
        actual_api_key = config['newsapi.org']['api_key_2']
    elif actual_api_key == config['newsapi.org']['api_key_2']:
        actual_api_key = config['newsapi.org']['api_key_3']
    elif actual_api_key == config['newsapi.org']['api_key_3']:
        actual_api_key = config['newsapi.org']['api_key_4']
    elif actual_api_key == config['newsapi.org']['api_key_4']:
        actual_api_key = config['newsapi.org']['api_key_5']
    elif actual_api_key == config['newsapi.org']['api_key_5']:
        actual_api_key = config['newsapi.org']['api_key_1']
