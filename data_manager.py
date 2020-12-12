"""Because of the restriction of API (100 request/day, 50 request/12 hours),
the program works with more than one api-key, and saves the json datas into database.
If more than one user selects the same country and news agency on the same day,
the second, third etc. request will be served from database,
only the first will be handled with API request. Headlines for the scrolling area too."""

import configparser
import requests
import datetime
import json
import psycopg2
from operator import itemgetter

config = configparser.ConfigParser()
config.read('app.ini')
actual_api_key = config['newsapi.org']['api_key_1']
number_of_api_keys = 5

def database_connection():
    dbname = config['db_connection']['dbname']
    user = config['db_connection']['user']
    host = config['db_connection']['host']
    password = config['db_connection']['password']
    try:
        connect_str = "dbname=" + dbname + " user=" + user + " host=" + host + " password=" + password
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
    # print(sorted_list_of_articles)
    return succeeded, sorted_list_of_articles_without_duplicates

def get_top_headlines(news_agency):
    api_calling_succeeded = False
    url = 'https://newsapi.org/v2/top-headlines?sources=' + news_agency + \
        '&apiKey=' + api_key
    top_headlines = []

    if news_agency == "reuters":
        top_headlines.append("Jajjj, ne!!! Kapjátok beeee!")
        top_headlines.append("Mátyás király álruhában végigjárt 15 vármegyét. Mindenki beparázott.")
    elif news_agency == "time":
        top_headlines.append("Ugandában gyémántlelőhelyet találtak, mindenki meggazdagszik!")
        top_headlines.append("Trump már nem a régi.")
    """else:
        top_headlines.append("Hatalmas siker! Magyar gazdák kitenyésztették az ötlábú lovat.")
        top_headlines.append("Gulácsinak kinőtt a haja. Na ja.")
        top_headlines.append("Vader nem halt meg, csak átalakult.")"""
    api_calling_succeeded = True
    """try:
        data_from_api = requests.get(url).json()
        status = data_from_api['status']
        if status == "ok":
            articles = data_from_api['articles']
            for article in articles:
                top_headlines.append(article['title'])
        elif status == "error":
            message = data_from_api['message']
            print('News API responded, but error occured. Message: ' + message)
        api_calling_succeeded = True
    except ValueError as value_err:
        print('JSON decoding fails: ' + str(value_err))
    except Exception as ex:
        print('Error during request datas from News API: ' + str(ex))"""
    return api_calling_succeeded, top_headlines

def article_request_handler(country_name, news_agency):
    succeeded = False
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    json_data = get_current_article_json_from_database(country_name, news_agency, current_date)
    if len(json_data) == 0:
        for api_key_num in range(number_of_api_keys):
            print("API KEY (api_key_num in for loop, actual_api_key):")
            print(api_key_num)
            print(actual_api_key)
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

def is_country_with_news_agency_in_db(country_name, news_agency):
    json_data = []
    json_data = query_result("SELECT json_data FROM article_jsons " + 
                            "WHERE country_name = %s AND news_agency = %s;", (country_name, news_agency))
    if len(json_data) > 0:
        return True
    return False

def add_articles_json(articles):
    return "yeah"

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

#get_articles('denmark', 'reuters')