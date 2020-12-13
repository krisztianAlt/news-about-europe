var app = app || {};

var originalTooltipInnerHTML;
var failedClickOnMap;
var previousNewsAgency;
var tooltipSpan;

app.tutorial = {
    
    // Info: http://jsfiddle.net/HJf8q/2/
    
    activateTutorialButton: function() {
        var tutorialButton = document.getElementById('tutorial-button');
        tutorialButton.addEventListener('click', activateTooltip, false);
        
        function activateTooltip(event) {
            tutorialEnds = false;
            // Remove original eventListeners from countries on the map:
            for (index = 0; index < countriesWithEventListeners.length; index++){
                countriesWithEventListeners[index].removeEventListener('click', app.mapHandling.clickOnCountry);
            }
            
            // Inactivate menus:
            app.tutorial.inactivateMenus();

            // Create tooltip:
            tooltipSpan = document.createElement('span');
            tooltipSpan.setAttribute('id', 'tooltip-span');
            counter = 9;
            originalTooltipInnerHTML = tooltipSpan.innerHTML = 'Hello!<br />Our tutorial starts. I go with your mouse pointer.<br />' + 
                                                            'You will get the first instruction after ' + counter + ' seconds.';
            var countdown = setInterval(function () {
                counter--;
                originalTooltipInnerHTML = tooltipSpan.innerHTML = 'Hello!<br />Our tutorial starts. I go with your mouse pointer.'  + 
                    '<br />You will get the first instruction after ' + counter + ' seconds.';
                if (counter < 1){
                    clearInterval(countdown);
                    app.tutorial.firstInstruction();
                };
            },
            1000);

            document.getElementById('place-of-tooltip').appendChild(tooltipSpan);
            window.addEventListener('mousemove', app.tutorial.tooltipPositioning, false);
            tutorialButton.removeEventListener('click', activateTooltip);
        };
    },

    tooltipPositioning: function(e) {
        var x = e.clientX;
        var y = e.clientY;
        var tooltipWidth = tooltipSpan.style.left = (x + 20) + 'px';
        var tooltipHeight = tooltipSpan.style.top = (y - 4) + 'px';
        var windowMaxWidth = window.innerWidth;
        var windowMaxHeight = window.innerHeight;
        var edgeWasNotTouched = true;
        if (parseInt(tooltipHeight.substr(0, tooltipHeight.length-2)) < 0) {
            tooltipSpan.innerHTML = 'Where do you go, mate?' + '<br />' + 'To the Artic Ocean?';
            edgeWasNotTouched = false;
        } else if (parseInt(tooltipHeight.substr(0, tooltipHeight.length-2)) > windowMaxHeight - 20) {
            tooltipSpan.innerHTML = 'Our destination is not Africa. Please, go back to Europe.';
            tooltipSpan.style.top = (y-15) + 'px';
            edgeWasNotTouched = false;
        } else if (parseInt(tooltipWidth.substr(0, tooltipWidth.length-2)) < 23) {
            tooltipSpan.innerHTML = 'Are you Mr. Columbus?';
            edgeWasNotTouched = false;
        } else if (parseInt(tooltipWidth.substr(0, tooltipWidth.length-2)) > windowMaxWidth -3) {
            tooltipSpan.innerHTML = '"Go West!"';
            edgeWasNotTouched = false;
            tooltipSpan.style.left = (x-100) + 'px';
        }
        if (edgeWasNotTouched) {
            tooltipSpan.innerHTML = originalTooltipInnerHTML;  
        }
    },

    firstInstruction: function () {
        originalTooltipInnerHTML = tooltipSpan.innerHTML = "On this page you can see the map of Europe." + "<br />" +
                                                            "Above the map you can find the available news agencies, the current is marked." + "<br />" +
                                                            "If you click on a country, you will get the datas of the most relevant articles from the collection of the current news agency," + "<br />" +
                                                            "about the selected country. <br /> <br /> Let's try it, please, click Hungary on the map!";
        
        app.tutorial.secondInstruction();
    },
    
    secondInstruction: function(){
        // Add new eventListeners to countries on the map:
        for (index = 0; index < countriesWithEventListeners.length; index++){
            failedClickOnMap = 0;
            countriesWithEventListeners[index].addEventListener('click', app.tutorial.clickOnCountryInTutorialMode, false);
        }
    },

    clickOnCountryInTutorialMode: function () {
        var countryID = this.getAttribute("id");
        var countryName = this.childNodes[0].textContent;
        if (countryID == 'hu-3') {
            originalTooltipInnerHTML = tooltipSpan.innerHTML = "Well done!" + "<br />" + "<br />" +  
                                        "Here you can read the titles and other datas of articles about the selected country." + "<br />" +
                                        "If you can't see the bottom of the list, you can navigate with the vertical scrolling bar" + "<br />" + 
                                        "at the right side of the window." +
                                        "<br />" + "If you click the reading man icon at the end of a line," + "<br />" +
                                        "the whole article will open in another tab in your browser." + "<br />" + "<br />" +
                                        "Please, close this list with the X button at the top right corner," + "<br />" + 
                                        "or the Close button at the bottom right corner!";
            
            app.mapHandling.getDataFromApi(countryIdsAndRawNames['hu-3'], 'Hungary');
            
            // Remove current eventListeners from countries on the map:
            for (index = 0; index < countriesWithEventListeners.length; index++){
                failedClickOnMap = 0;
                countriesWithEventListeners[index].removeEventListener('click', app.tutorial.clickOnCountryInTutorialMode, false);
            }

            $("#newsModal").on("hidden.bs.modal", function () {
                app.tutorial.thirdInstruction();
            });

        } else if (countryID != 'hu-3' && failedClickOnMap == 0) {
            originalTooltipInnerHTML = tooltipSpan.innerHTML = "It's not Hungary. It's " + countryName + ". <br />" +"Hungary is a schnitzel shaped" + "<br />" + 
                                                                "country in the hearth of Europe. <br /> Click it!";
            failedClickOnMap++;
        } else {
            originalTooltipInnerHTML = tooltipSpan.innerHTML = "Oh, I see... You are a natural born tester. <br />" + 
                                                                "It's not Hungary. It's " + countryName + ", as you know. <br />" + 
                                                                "Click Hungary!";
        }
    },

    thirdInstruction: function(){
        previousNewsAgency = app.mapHandling.getSelectedNewsAgency();
        var newsAgencyRadios = document.getElementsByClassName('form-check-input');
        for (index = 0; index < newsAgencyRadios.length; index++) {
            newsAgencyRadios[index].addEventListener('click', app.tutorial.clickOnNewsAgencyRadioButtons, false);
        }

        originalTooltipInnerHTML = tooltipSpan.innerHTML = "Okay. <br />" +
                        "At the lower section of this page, there is a horizontal yellow bar. <br />" + 
                        "There you can read a scrolling text: the top headlines by the selected news agency. <br />" +
                        "Please, click another agency above the map.";
        
        
    },

    clickOnNewsAgencyRadioButtons: function(){
        var currentNewsAgency = app.mapHandling.getSelectedNewsAgency();
        if (previousNewsAgency == currentNewsAgency) {
            originalTooltipInnerHTML = tooltipSpan.innerHTML = "You clicked the current news agency. <br />" +
                        "Please, select another one.";
        } else {
            
            // Remove eventListeners from news agency radio buttons:
            var newsAgencyRadios = document.getElementsByClassName('form-check-input');
            for (index = 0; index < newsAgencyRadios.length; index++) {
                newsAgencyRadios[index].removeEventListener('click', app.tutorial.clickOnNewsAgencyRadioButtons);
            }

            app.tutorial.fourthInstruction();
        };
    },

    fourthInstruction: function() {
        originalTooltipInnerHTML = tooltipSpan.innerHTML = "Great!<br/>If you put the mouse pointer over the scrolling text, it will stop,<br/>" +
                                "so you will be able to read the headlines calmly. <br/> Let's go there!";
        var scrollingText = document.getElementById('text-container-div');
        scrollingText.addEventListener('mouseenter', app.tutorial.mouseOnScroller, false);
    },

    mouseOnScroller: function(){
        var scrollingText = document.getElementById('text-container-div');
        scrollingText.removeEventListener('mouseenter', app.tutorial.mouseOnScroller);

        var counter = 10;
        originalTooltipInnerHTML = tooltipSpan.innerHTML = 'OK. The tutorial ends.<br/>The countries on the map will be clickable again after '  + counter + ' seconds.<br/>' +
                                                                "Thank you for your attention!";
        var countdown = setInterval(function () {
            counter--;
            originalTooltipInnerHTML = tooltipSpan.innerHTML = 'OK. The tutorial ends.<br/>The countries on the map will be clickable again after '  + counter + ' seconds.<br/>' +
                                                                "Thank you for your attention!";
            if (counter < 1){
                clearInterval(countdown);
                app.tutorial.stopTutorial();
            };
        },
        1000);
    },

    inactivateMenus: function(){
        // Info: https://css-tricks.com/how-to-disable-links/
        var menus = document.getElementsByClassName('nav-item');
        for (index = 0; index < menus.length; index++){
            menus[index].classList.add("isDisabled");
        }
    },

    activateMenus: function(){
        var menus = document.getElementsByClassName('nav-item');
        for (index = 0; index < menus.length; index++){
            menus[index].classList.remove("isDisabled");
        }
    },

    stopTutorial: function(){
        document.getElementById('place-of-tooltip').removeChild(tooltipSpan);
        window.removeEventListener('mousemove', app.tutorial.tooltipPositioning);
        app.tutorial.activateMenus();
        app.mapHandling.addEventListenersToCountries();
        app.tutorial.activateTutorialButton();
        app.menuHandling.setFirstMenuToActive();
    }
}