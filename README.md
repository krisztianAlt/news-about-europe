# News About Europe


**About the program**

On the website (https://news-about-europe.herokuapp.com/), as a user you can select a news agency from a list and a country from the map of Europe. Then you get a list in a dialog box, which contains datas of articles about the selected country, from the news collection of the selected agency. Below the map there is a scrolling bar: here you can read the top headlines from the selected news agency.

As a user, if you want to, you can activate tutorial mode: you can get informations about the usage of the site. In tutorial mode, if you use an environment with mouse (desktop PC, laptop), infos appear in a tooltip, which follows your mouse pointer; if you visit the site on a device, which has touchscreen, you get the instructions in dialog boxes.

As a user, you can select "Android version" menu at the navigation bar. There you can download the APK file - you can install it on your mobile device. Another option to try the app: you can click the link of Android version's GitHub repo - just clone that repo, and you can deploy the app from Android Studio to your device, or you can run it in an emulator. In the Android version, you can select from not only 4, but 6 news agencies, you can reorder the listed articles by title, author and date, in ascending and descending too, and you can save your favourite article datas for later occasions.


**About programming**

With this project I have wanted to practice geting datas from a REST API: sending requests, treat responses at Python back-end. The program sends a request with the selected country and news agency to News API (https://newsapi.org/). News API sends datas of 20 articles in JSON format. The program sorts the articles by publishing date, delete recurring articles, then lists the article datas in a modal at the front-end.

Because of the restriction of API (100 requests/day, 50 requests/12 hours), the program saves the json datas into database. If more than one user selects the same country and news agency on the same day, the second, third etc. selection will be served from database, only the first will be served with API request. Headlines for the scrolling area are handled in the same way.

With the tutorial mode I have wanted to practice the communication with users, and the usage of event listeners in Javascript. Depending on the browser runs on desktop environment or mobile device, the site communicates with the user in tooltip (which follows the mouse pointer) or modals.

Author of map: Maix (https://commons.wikimedia.org/wiki/File:Blank_map_of_Europe_cropped.svg), CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/deed.en).