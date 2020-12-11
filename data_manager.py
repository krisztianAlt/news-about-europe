import configparser
import requests
from operator import itemgetter


config = configparser.ConfigParser()
config.read('app.ini')
api_key = config['newsapi.org']['api_key']


def get_news_from_api(country_name, news_agency):
    api_calling_succeeded = False
    url = 'https://newsapi.org/v2/everything?q="' + country_name + \
        '"&sources=' + news_agency + \
        '&sortBy=relevancy&apiKey=' + api_key
    sorted_list_of_articles_without_duplicates = []
    try:
        data_from_api = requests.get(url).json()
        articles = data_from_api['articles']
        sorted_list_of_articles = sorted(articles, key=itemgetter('publishedAt'), reverse=True)

        # Delete recurring news from list:
        titles = set()
        for article in sorted_list_of_articles:
            if article['title'].split(' - ')[0] not in titles:
                titles.add(article['title'].split(' - ')[0])
                sorted_list_of_articles_without_duplicates.append(article)

        api_calling_succeeded = True
    except ValueError as value_err:
        print('JSON decoding fails: ' + str(value_err))
    except Exception as ex:
        print('Error during request datas from News API: ' + str(ex))
    return api_calling_succeeded, sorted_list_of_articles_without_duplicates
