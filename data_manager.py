import configparser
import requests
from operator import itemgetter


config = configparser.ConfigParser()
config.read('app.ini')
api_key = config['newsapi.org']['api_key_1']


def get_news_from_api():
    country_name = 'Hungary'
    news_agency = 'reuters'
    url = 'https://newsapi.org/v2/everything?q="' + country_name + \
        '"&sources=' + news_agency + \
        '&sortBy=relevancy&apiKey=' + api_key
    try:
        data_from_api = requests.get(url).json()
        articles = data_from_api['articles']
        sorted_list_of_articles = sorted(articles, key=itemgetter('publishedAt'), reverse=True)
        sorted_list_of_articles_without_duplicates = []

        # Delete recurring news from list:
        titles = set()
        for article in sorted_list_of_articles:
            if article['title'].split(' - ')[0] not in titles:
                titles.add(article['title'].split(' - ')[0])
                sorted_list_of_articles_without_duplicates.append(article)

        # Check news list:
        counter = 1
        for article in sorted_list_of_articles_without_duplicates:
            print(str(counter) + '.: ' + article['title'] + ' - ' + article['publishedAt'])
            counter = counter + 1

    except ValueError as value_err:
        print('JSON decoding fails: ' + value_err)
    except Exception as ex:
        print('Error during call News API: ' + ex)


get_news_from_api()