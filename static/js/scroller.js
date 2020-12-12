var app = app || {};

app.scrollerHandling = {

    startScroller: function () {
        var label = document.getElementById('scroller-label');
        label.textContent = 'World news from Reuters';
        app.mapHandling.listeningRadioButtons();
        app.scrollerHandling.refreshScroller('reuters');
    },

    refreshScroller: function (newsAgency) {
        var label = document.getElementById('scroller-label');
        label.textContent = 'World news from ' + app.scrollerHandling.convertNewsAgencyName(newsAgency);
        
        // request data from Python server
        var dataPackage = {'selected_news_agency': newsAgency};
        $.ajax({
            url: 'get_top_headlines',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataPackage),
            dataType: 'json',
            success: function(response) {
                var success = response.succeeded;
                var top_headlines = response.top_headlines;
                if (success && top_headlines.length!=0) {
                    $("#scrolling-text").fadeOut(500).promise().done(function(){
                        document.getElementById("scrolling-text").innerHTML = top_headlines[0] + " ✦ " + top_headlines[1];
                        $("#scrolling-text").fadeIn(500);
                    });
                } else if (success && top_headlines.length==0) {
                    
                } else {
                    
                };
            },
            error: function() {
                console.log('ERROR: calling endpoint failed.');
            }
        });
    },

    convertNewsAgencyName: function (newsAgency) {
        var newsAgencyName = '';
        switch(newsAgency) {
            case 'bbc-news':
                newsAgencyName = 'BBC News';
                break;
            case 'cbc-news':
                newsAgencyName = 'CBC News';
                break;
            case 'cnn':
                newsAgencyName = 'CNN';
                break;
            case 'independent':
                newsAgencyName = 'Independent';
                break;
            case 'reuters':
                newsAgencyName = 'Reuters';
                break;
            case 'time':
                newsAgencyName = 'Time';
                break;
            default:
                newsAgencyName = 'Reuters';
        };
        return newsAgencyName;
    }

}