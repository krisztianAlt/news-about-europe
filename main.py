import data_manager
import os
from flask import Flask, request, render_template, url_for, jsonify

app = Flask(__name__)
app.secret_key = data_manager.config['flask_secret_key']['SECRET_KEY']
port_number = data_manager.config['port']['port_number']

@app.route('/')
def main_page():
    print("We are in main")
    return render_template('map.html')

@app.route('/get_articles', methods=['POST'])
def get_articles_datas():
    country_name = request.get_json()['country_name']
    selected_news_agency = request.get_json()['selected_news_agency']
    succeeded, articles = data_manager.get_articles(country_name, selected_news_agency)
    return jsonify(succeeded=succeeded, article_datas=articles)

@app.route('/get_top_headlines', methods=['POST'])
def get_top_headlines_datas():
    selected_news_agency = request.get_json()['selected_news_agency']
    succeeded, top_headlines = data_manager.get_top_headlines(selected_news_agency)
    return jsonify(succeeded=succeeded, top_headlines=top_headlines)

@app.route('/android', methods=['GET'])
def android():
    return render_template('android.html')

@app.route('/android_download', methods=['GET'])
def download_apk():
    return "ok"

@app.errorhandler(404)
def page_not_found(e):
    print("404 status code: " + str(e))
    print("Requested URL: " + str(request.path))
    return render_template('404.html')


if 'DYNO' not in os.environ:
    if __name__ == '__main__':
        app.debug = True
        app.run(port=port_number)
