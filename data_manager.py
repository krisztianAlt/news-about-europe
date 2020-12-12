import configparser
import requests
from operator import itemgetter


config = configparser.ConfigParser()
config.read('app.ini')
api_key = config['newsapi.org']['api_key_1']


def get_news_from_api(country_name, news_agency):
    api_calling_succeeded = False
    url = 'https://newsapi.org/v2/everything?q="' + country_name + \
        '"&sources=' + news_agency + \
        '&sortBy=relevancy&apiKey=' + api_key
    sorted_list_of_articles_without_duplicates = []
    try:
        data_from_api = requests.get(url).json()
        status = data_from_api['status']
        if status == "ok":
            articles = data_from_api['articles']
            sorted_list_of_articles = sorted(articles, key=itemgetter('publishedAt'), reverse=True)

            # Delete recurring news from list:
            titles = set()
            for article in sorted_list_of_articles:
                if article['title'].split(' - ')[0] not in titles:
                    titles.add(article['title'].split(' - ')[0])
                    sorted_list_of_articles_without_duplicates.append(article)
        elif status == "error":
            message = data_from_api['message']
            print('News API responded, but error occured. Message: ' + message)
        api_calling_succeeded = True
    except ValueError as value_err:
        print('JSON decoding fails: ' + str(value_err))
    except Exception as ex:
        print('Error during request datas from News API: ' + str(ex))
    return api_calling_succeeded, sorted_list_of_articles_without_duplicates

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
