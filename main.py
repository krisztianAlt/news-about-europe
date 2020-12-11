import configparser


config = configparser.ConfigParser()
config.read('app.ini')
print(config['newsapi.org']['api_key_1'])
