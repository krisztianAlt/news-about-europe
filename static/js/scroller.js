var app = app || {};

var step = 3;
var speed = 30;
var headlinesInOneString = '';
var actualScrollingUnitWithTimer;
var newsAgencyChanged;
var mobileDevice;

app.scrollerHandling = {

    startScroller: function () {

        // Detect if the browser runs on mobile device or desktop:
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
            mobileDevice = true;
          } else {
            mobileDevice = false;
        }

        var label = document.getElementById('scroller-label');
        label.textContent = 'World news from Reuters';
        app.mapHandling.listeningRadioButtons();
        app.scrollerHandling.getHeadlinesFromServerByNewsAgency('reuters');
    },

    getHeadlinesFromServerByNewsAgency: function (newsAgency) {
        headlinesInOneString = '';
        newsAgencyChanged = true;
        app.scrollerHandling.stopActualScrollingUnit();
        var label = document.getElementById('scroller-label');
        label.textContent = 'World news from ' + app.scrollerHandling.convertNewsAgencyName(newsAgency);
        
        // Request data from Python server:
        var dataPackage = {'selected_news_agency': newsAgency};
        $.ajax({
            url: 'get_top_headlines',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataPackage),
            dataType: 'json',
            success: function(response) {
                var success = response.succeeded;
                var topHeadlines = response.top_headlines;
                if (success && topHeadlines.length!=0) {
                    // Concatenate headlines
                    for (index = 0; index < topHeadlines.length; index++) {
                        for (index = 0; index < topHeadlines.length; index++) {
                            headlinesInOneString += topHeadlines[index];
                            if (index+1 < topHeadlines.length) {
                                headlinesInOneString += " ✦ ";
                            }
                        }
                        app.scrollerHandling.scroll(headlinesInOneString);
                    }
                } else if (success && typeof top_headlines === 'undefined') {
                    headlinesInOneString = 'Sorry, no headlines.';
                    app.scrollerHandling.scroll(headlinesInOneString);
                } else {
                    console.log('Calling API failed.');
                };
            },
            error: function() {
                console.log('ERROR: calling endpoint failed.');
            }
        });
    },

    scroll: function (headlines) {
        // Good tips for scrolling: https://www.w3.org/TR/WCAG20-TECHS/SCR33.html
        
        newsAgencyChanged = false;
        var containerOfScrollingText = document.getElementsByClassName('scroll-left')[0].getElementsByClassName('scroller-element')[0];
        
        // Delete old scrolling paragraph
        var oldTextParagraph = document.getElementById('scrolling-text');
        oldTextParagraph.remove();
                
        // Create new scrolling paragraph
        var newTextParagraph = document.createElement('p');
        newTextParagraph.setAttribute('id', 'scrolling-text');
        newTextParagraph.innerText = headlines;
        var scrollingContainerWidth = app.scrollerHandling.getActualWidthOfScrollingArea();
        containerOfScrollingText.appendChild(newTextParagraph);
        var textWidth = document.getElementById('scrolling-text').offsetWidth;
        var xPosition = scrollingContainerWidth;
        newTextParagraph.style.left = xPosition+"px";            
        
        if (mobileDevice){
            newTextParagraph.addEventListener('touchstart', e => {
                step = 0;
            });
    
            newTextParagraph.addEventListener('touchend', e => {
                step = 2;
            });
        } else {
            newTextParagraph.addEventListener('mouseenter', e => {
                step = 0;
            });
    
            newTextParagraph.addEventListener('mouseleave', e => {
                step = 2;
            });
        }
        
        // Scrolling:
        function scrolling () {
            actualScrollingUnitWithTimer = setTimeout(
                function () {
                    xPosition -= step;
                    newTextParagraph.style.left = xPosition+"px";
                    if (xPosition+textWidth > 0) {
                        app.scrollerHandling.stopActualScrollingUnit();
                        if (newsAgencyChanged == false) {
                            scrolling ();    
                        }
                    }
                },
                speed
            )
            
            if (xPosition+textWidth-step <= 0){
                scrollingContainerWidth = app.scrollerHandling.getActualWidthOfScrollingArea();
                xPosition = scrollingContainerWidth;
                newTextParagraph.style.left = xPosition+"px";
            }
        }
        scrolling();
    },

    getActualWidthOfScrollingArea: function (){
        return document.getElementsByClassName('scroll-left')[0].offsetWidth;
    },
    
    stopActualScrollingUnit: function(){
        if (actualScrollingUnitWithTimer) {
            clearTimeout(actualScrollingUnitWithTimer);
        }
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