var app = app || {};

var countryIdsAndRawNames = {
    "ad-4": "andorra",
    "al-0": "albania",
    "at-3": "austria",
    "ba-1": "bosnia",
    "be-2": "belgium",
    "bg-3": "bulgaria",
    "by-5": "belarus",
    "ch-4": "switzerland",
    "crimea_disputed-0": "crimea",
    "cy-6": "cyprus",
    "cz-1": "czech-republic",
    "ee-8": "estonia",
    "de-2": "germany",
    "dk-9": "denmark",
    "es-4": "spain",
    "fi-5": "finland",
    "fo-3": "faroe",
    "fr-7": "france",
    "gb-gbn-5": "united-kingdom",
    "gr-7": "greece",
    "hr-2": "croatia",
    "hu-3": "hungary",
    "ie-5": "ireland",
    "is-4": "iceland",
    "it-4": "italy",
    "lt-3": "lithuania",
    "lu-7": "luxembourg",
    "lv-1": "latvia",
    "mc-6": "monaco",
    "me-2": "montenegro",
    "md-1": "moldova",
    "mk-5": "macedonia",
    "mt-0": "malta",
    "nl-3": "netherlands",
    "no-6": "norway",
    "pl-1": "poland",
    "pt-0": "portugal",
    "ro-1": "romania",
    "rs-8": "serbia",
    "ru-main-8": "russia",
    "ru-kgd-6": "kaliningrad",
    "se-7": "sweden",
    "si-9": "slovenia",
    "sk-2": "slovakia",
    "sm-2": "san-marino",
    "tr-7": "turkey",
    "transnistria_proper-2": "transnistria",
    "ua-2": "ukraine",
    "xk-6": "kosovo"
}

app.mapHandling = {

    activateCountriesOnMap: function () {
        var countriesOnMap = document.getElementsByTagName('path');
        for (index = 0; index < countriesOnMap.length; index++) {
            countriesOnMap[index].addEventListener('click', function () {
                var countryID = this.getAttribute("id");
                console.log(countryID);
                if (countryID in countryIdsAndRawNames) {
                    var countryName = this.childNodes[0].textContent;
                    console.log(countryName);
                    app.mapHandling.getDataFromApi(countryIdsAndRawNames[countryID], countryName);
                }    
            })
        };
    },

    getDataFromApi: function (countryRawName, countryName) {
        var selectedNewsAgency = app.mapHandling.getSelectedNewsAgency();
        var dataPackage = {'country_name': countryRawName, 'selected_news_agency': selectedNewsAgency};
        $.ajax({
            url: 'get_articles',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataPackage),
            dataType: 'json',
            success: function(response) {
                var success = response.succeeded;
                var articles = response.article_datas;
                if (success && articles.length!=0) {
                    $('#newsModal').modal('toggle');
                    app.mapHandling.listNews(articles, countryName, selectedNewsAgency);
                } else if (success && articles.length==0) {
                    $('#messageModal').modal('toggle');
                    var modalTitle = document.getElementById("messageModalLabel");
                    modalTitle.textContent = "There aren't articles about " + countryName + ". Please, try to choose another country or news agency.";
                } else {
                    $('#messageModal').modal('toggle');
                    var modalTitle = document.getElementById("messageModalLabel");
                    modalTitle.textContent = "Sorry, problem occured, please, try later.";
                };
            },
            error: function() {
                console.log('ERROR: calling endpoint failed.');
            }
        });
    },

    listNews: function (news, countryName, newsAgency) {
        var modalTitle = document.getElementById("newsModalLabel");
        modalTitle.textContent = "News about " + countryName + " from " + app.scrollerHandling.convertNewsAgencyName(newsAgency);

        // delete previous news-table content in the modal:
        var deleteNewsRows = document.getElementsByClassName('news-table-row');
        while (deleteNewsRows.length > 0) {
            deleteNewsRows[0].remove();
        }

        // put data into the table, row by row:
        var newsTable = document.getElementById('news-table-body');
        for (newsIndex = 0; newsIndex < news.length; newsIndex++) {

            var newRow = document.createElement('tr');
            newRow.className = 'news-table-row';

            var title = document.createElement('td');
            var titleText = document.createTextNode(news[newsIndex].title);
            title.appendChild(titleText);

            var author = document.createElement('td');
            var authorText = document.createTextNode("no author data");
            if (news[newsIndex].author != null){
                authorText = document.createTextNode(news[newsIndex].author);
            }
            author.appendChild(authorText);

            var link = document.createElement('td');
            var anchor = document.createElement('a');
            /*document.createElement('href');
            var linkText = document.createTextNode("Read");
            anchor.appendChild(linkText);*/
            var linkImage = document.createElement('img');
            linkImage.setAttribute('class', 'icon-in-modal');
            linkImage.setAttribute('src', '/static/newspaper-icon.png');
            anchor.appendChild(linkImage)
            anchor.target = "_blank";
            anchor.title = "Read";
            anchor.href = news[newsIndex].url;
            link.appendChild(anchor);

            var date = document.createElement('td');
            var dateWithoutTime = news[newsIndex].publishedAt.substr(0, 10);
            var dateText = document.createTextNode(dateWithoutTime);
            date.appendChild(dateText);

            if (news[newsIndex].urlToImage != null) {
                var image = document.createElement('img');
                image.setAttribute('class', 'image-in-modal');
                image.setAttribute('src', news[newsIndex].urlToImage);
            } else {
                var image = document.createElement('td');
                var text_without_image = document.createTextNode('no image URL');
                image.appendChild(text_without_image);
            }

            newRow.appendChild(title);
            newRow.appendChild(author);
            newRow.appendChild(date);
            newRow.appendChild(image);
            newRow.appendChild(link);

            newsTable.appendChild(newRow);
        }
    },

    getSelectedNewsAgency: function() {
        var selectedNewsAgency = '';
        var newsAgencyRadios = document.getElementsByClassName('form-check-input');
        for (index = 0; index < newsAgencyRadios.length; index++) {
            if (newsAgencyRadios[index].checked) {
                selectedNewsAgency = newsAgencyRadios[index].value;
            }
        }
        return selectedNewsAgency;
    },

    listeningRadioButtons: function () {
        var newsAgencyRadios = document.getElementsByClassName('form-check-input');
        for (index = 0; index < newsAgencyRadios.length; index++) {
            newsAgencyRadios[index].addEventListener('click', function (event) {
                clickedAgency = this.value;
                app.scrollerHandling.getHeadlinesFromServerByNewsAgency(clickedAgency);
            })
        }
    }

}