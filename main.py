import data_manager
from flask import Flask, request, render_template, url_for, json, jsonify


app = Flask(__name__)
app.secret_key = data_manager.config['flask_secret_key']['SECRET_KEY']
port_number = data_manager.config['port']['port_number']

@app.route('/')
def main_page():
    return render_template('map.html')

@app.route('/get_articles', methods=['POST'])
def get_articles_datas():
    country_name = request.get_json()['country_name']
    api_calling_succeeded, articles = data_manager.get_news_from_api(country_name)
    return jsonify(succeeded=api_calling_succeeded, article_datas=articles)

@app.errorhandler(404)
def page_not_found(e):
    print("404 status code: " + str(e))
    print("Requested URL: " + str(request.path))
    return render_template('404.html')


if __name__ == '__main__':
    app.debug = True
    app.run(port=port_number)
