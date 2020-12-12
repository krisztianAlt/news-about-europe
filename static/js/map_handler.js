var app = app || {};

app.mapHandling = {

    showMap: function () {
        // CSSMap;
        $("#map-europe").CSSMap({
            "size": 540,
            "tooltips": "floating-top-center",
            "responsive": "auto",
            "cities": true,
            onClick: function(e){
                var link = e.children("A").eq(0).attr("href");
                    // text = e.children("A").eq(0).text(),
                    // countryCode = e.children("A").eq(0).attr("data-country-code");
                var countryName = link.substr(1);
                app.mapHandling.getDataFromApi(countryName);
            }
        });
    },

    getDataFromApi: function (countryName) {
        var selectedNewsAgency = app.mapHandling.getSelectedNewsAgency();
        var dataPackage = {'country_name': countryName, 'selected_news_agency': selectedNewsAgency};
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
                    modalTitle.textContent = "There aren't articles about " + countryName.charAt(0).toUpperCase() + countryName.substr(1) + ". Please, try to choose another country or news agency.";
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
        modalTitle.textContent = "News about " + countryName.charAt(0).toUpperCase() + countryName.substr(1) + " from " + app.scrollerHandling.convertNewsAgencyName(newsAgency);

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