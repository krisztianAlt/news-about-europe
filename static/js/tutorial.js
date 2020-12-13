var app = app || {};

var originalTooltipInnerHTML;
var failedClickOnMap;
var previousNewsAgency;
var tooltipSpan;
var tutorialCheckbox;
var mobileTutorialParagraph;

app.tutorial = {
    
    activateTutorialSwitch: function() {

        tutorialCheckbox = document.getElementById('tutorial-checkbox');
        tutorialCheckbox.addEventListener('click', activateTooltipOrModal, false);
        
        function activateTooltipOrModal(event) {
            tutorialEnds = false;

            // Remove original eventListeners from countries on the map:
            for (index = 0; index < countriesWithEventListeners.length; index++){
                countriesWithEventListeners[index].removeEventListener('click', app.mapHandling.clickOnCountry);
            }
            
            app.tutorial.inactivateMenus();
            app.tutorial.moveRightTutorialSwitchFirst();

            if (mobileDevice){
                // Show tutorial info modal:
                app.tutorial.openMobileTutorialModalWithNewInstruction("Hello! Our tutorial starts. " + 
                                        "Close this info window, and you will get your first instruction.");

                $("#tutorialModal").on("hidden.bs.modal", function () {
                    $("#tutorialModal").off("shown.bs.modal");
                    app.tutorial.firstInstruction();
                    $("#tutorialModal").off("hidden.bs.modal");
                });
            } else {
                // Create tooltip:
                tooltipSpan = document.createElement('span');
                tooltipSpan.setAttribute('id', 'tooltip-span');
                originalTooltipInnerHTML = tooltipSpan.innerHTML =
                            'Hello!<br />Our tutorial starts. I go with your mouse pointer.<br />' + 
                            'Please, click again the Tutorial mode toggle<br/>to get the first instruction.';
                document.getElementById('place-of-tooltip').appendChild(tooltipSpan);
                window.addEventListener('mousemove', app.tutorial.tooltipPositioning, false);  
                tutorialCheckbox.addEventListener('click', app.tutorial.firstInstruction, false);
            }
            tutorialCheckbox.removeEventListener('click', activateTooltipOrModal);   
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
        } else if (parseInt(tooltipHeight.substr(0, tooltipHeight.length-2)) > windowMaxHeight - 10) {
            tooltipSpan.innerHTML = 'Our destination is not Africa. Please, go back to Europe.';
            tooltipSpan.style.top = (y-40) + 'px';
            edgeWasNotTouched = false;
        } else if (parseInt(tooltipWidth.substr(0, tooltipWidth.length-2)) < 23) {
            tooltipSpan.innerHTML = 'Are you Mr. Columbus?';
            edgeWasNotTouched = false;
        } else if (parseInt(tooltipWidth.substr(0, tooltipWidth.length-2)) > windowMaxWidth -3) {
            tooltipSpan.innerHTML = '"Go West!"';
            edgeWasNotTouched = false;
            tooltipSpan.style.left = (x-100) + 'px';
        } else if (parseInt(tooltipHeight.substr(0, tooltipHeight.length-2)) > windowMaxHeight - 100) {
            tooltipSpan.style.top = (y-50) + 'px';
        }
        if (edgeWasNotTouched) {
            tooltipSpan.innerHTML = originalTooltipInnerHTML;  
        }
    },

    firstInstruction: function () {  
        if (mobileDevice){
            app.tutorial.openMobileTutorialModalWithNewInstruction("On this webpage you can see the map of Europe. " +
                                                        "Above the available news agencies, " +
                                                        "the current is marked. If you click a country on the map, " +
                                                        "you will get datas of the most relevant articles " +
                                                        "from the collection of the current news agency, " +
                                                        "about the selected country. " +
                                                        "Please, try it: click Hungary on the map!");
        } else {
            tutorialCheckbox.removeEventListener('click', app.tutorial.firstInstruction);
            app.tutorial.moveRightTutorialSwitchSecond();
            originalTooltipInnerHTML = tooltipSpan.innerHTML = "On this page you can see the map of Europe.<br />" +
                                                            "Above the map you can find the available news agencies,<br/>" +
                                                            "the current is marked. If you click a country on the map,<br/>" +
                                                            "you will get the datas of the most relevant articles<br/>" +
                                                            "from the collection of the current news agency,<br/>" +
                                                            "about the selected country.<br /><br />" +
                                                            "Please, try it: click Hungary on the map!";
        }
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
            app.mapHandling.getDataFromApi(countryIdsAndRawNames['hu-3'], 'Hungary');
            $("#newsModal").on("shown.bs.modal", function () {
                if (mobileDevice) {
                    app.tutorial.openMobileTutorialModalWithNewInstruction("Well done! Now a list appeared, which contains datas of articles about the selected country. " +
                    "If you click the reading man icon at the end of a line, " +
                    "the whole article will open in your browser. " +
                    "Please, close the list with the X button at the top right corner, " + 
                    "or the Close button at the bottom right corner!");
                } else {
                    originalTooltipInnerHTML = tooltipSpan.innerHTML = "Well done!" + "<br />" + "<br />" +  
                    "Here you can read the titles and other datas of articles about the selected country.<br />" +
                    "If you can't see the bottom of the list, you can navigate with the vertical scrolling bar<br />" + 
                    "at the right side of the window.<br />" +
                    "If you click the reading man icon at the end of a line,<br />" +
                    "the whole article will open in another tab in your browser.<br /><br />" +
                    "Please, close this list with the X button at the top right corner,<br />" + 
                    "or the Close button at the bottom right corner!";
                }
            });
            
            // Remove current eventListeners from countries on the map:
            for (index = 0; index < countriesWithEventListeners.length; index++){
                failedClickOnMap = 0;
                countriesWithEventListeners[index].removeEventListener('click', app.tutorial.clickOnCountryInTutorialMode, false);
            }

            $("#newsModal").on("hidden.bs.modal", function () {
                $("#newsModal").off("shown.bs.modal");
                app.tutorial.thirdInstruction();
                $("#newsModal").off("hidden.bs.modal");
            });

        } else if (countryID != 'hu-3' && failedClickOnMap == 0) {
            if (mobileDevice){
                app.tutorial.openMobileTutorialModalWithNewInstruction("It's not Hungary. It's " + 
                                                        countryName + ". Hungary is a schnitzel shaped " + 
                                                        "country in the hearth of Europe. Click it!"); 
            } else {
                originalTooltipInnerHTML = tooltipSpan.innerHTML = "It's not Hungary. It's " + countryName + ".<br />Hungary is a schnitzel shaped<br />" + 
                "country in the hearth of Europe. <br /> Click it!";
            }
            failedClickOnMap++;
        } else {
            if (mobileDevice) {
                app.tutorial.openMobileTutorialModalWithNewInstruction("Oh, I see... You are a natural born tester. " + 
                "It's not Hungary. It's " + countryName + ", as you know. Click Hungary!");
            } else {
                originalTooltipInnerHTML = tooltipSpan.innerHTML = "Oh, I see... You are a natural born tester.<br />" + 
                                                                "It's not Hungary. It's " + countryName + ", as you know. <br />" + 
                                                                "Click Hungary!";
            }
        }
    },

    thirdInstruction: function(){
        previousNewsAgency = app.mapHandling.getSelectedNewsAgency();
        var newsAgencyRadios = document.getElementsByClassName('form-check-input');
        for (index = 0; index < newsAgencyRadios.length; index++) {
            newsAgencyRadios[index].addEventListener('click', app.tutorial.clickOnNewsAgencyRadioButtons, false);
        }
        if (mobileDevice) {
            app.tutorial.openMobileTutorialModalWithNewInstruction("Okay. Below the map, there is a horizontal yellow bar. " + 
                    "There you can read a scrolling text: the top headlines by the selected news agency. " +
                    "Please, click another agency above the map.");
        } else {
            originalTooltipInnerHTML = tooltipSpan.innerHTML = "Okay. <br />" +
            "At the lower section of this page, there is a horizontal yellow bar. <br />" + 
            "There you can read a scrolling text: the top headlines by the selected news agency. <br />" +
            "Please, click another agency above the map.";
        }
    },

    clickOnNewsAgencyRadioButtons: function(){
        var currentNewsAgency = app.mapHandling.getSelectedNewsAgency();
        if (previousNewsAgency == currentNewsAgency) {
            if (mobileDevice){
                app.tutorial.openMobileTutorialModalWithNewInstruction("You clicked the current news agency. " +
                    "Please, select another one.");
            } else {
                originalTooltipInnerHTML = tooltipSpan.innerHTML = "You clicked the current news agency.<br />" +
                                                                    "Please, select another one.";
            }
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
        var scrollingTextContainer = document.getElementById('text-container-div');
        if (mobileDevice){
            app.tutorial.openMobileTutorialModalWithNewInstruction("Great! If you touch the scrolling text, it will stop, " +
            "so you will be able to read the headlines calmly. Let's go there!");
            scrollingTextContainer.addEventListener('touchstart', app.tutorial.textStopOnScroller, false);
        } else {
            originalTooltipInnerHTML = tooltipSpan.innerHTML = "Great!<br/>If you put the mouse pointer over the scrolling text, it will stop,<br/>" +
                                                                "so you will be able to read the headlines calmly. <br/> Let's go there!";
            scrollingTextContainer.addEventListener('mouseenter', app.tutorial.textStopOnScroller, false);
        }
    },

    textStopOnScroller: function(){
        var scrollingTextContainer = document.getElementById('text-container-div');
        if (mobileDevice) {
            scrollingTextContainer.removeEventListener('touchstart', app.tutorial.textStopOnScroller);
            app.tutorial.openMobileTutorialModalWithNewInstruction('OK. The tutorial ends. Just click again the Tutorial mode toggle, ' +
                                                                'and the countries on the map and above the menus will be clickable again.');
        } else {
            scrollingTextContainer.removeEventListener('mouseenter', app.tutorial.textStopOnScroller);
            originalTooltipInnerHTML = tooltipSpan.innerHTML = 'OK. The tutorial ends.<br/>Just click again the Tutorial mode toggle,<br/>' +
                                                                'and the countries on the map and above the menus will be clickable again.<br/>' +
                                                                'Thank you for your attention!';
        }
        tutorialCheckbox.addEventListener('click', app.tutorial.stopTutorial, false);
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

    moveRightTutorialSwitchFirst: function(){
        if (mobileDevice){
            $(".slider").css({backgroundColor: "#7ABA7A"});
            $("#circle").animate({left: "25px"}, 500);
        } else {
            $(".slider").css({backgroundColor: "#a1a1a1"});
            $("#circle").animate({left: "14px"}, 500);
        }
    },

    moveRightTutorialSwitchSecond: function(){
        $(".slider").css({backgroundColor: "#7ABA7A"});
        $("#circle").animate({left: "25px"}, 500);
    },

    moveLeftTutorialSwitch: function(){
        $(".slider").css({backgroundColor: "#ccc"});
        $("#circle").animate({left: "2px"}, 500);
    },

    stopTutorial: function(){
        tutorialCheckbox.removeEventListener('click', app.tutorial.stopTutorial);
        if (mobileDevice) {
            app.tutorial.openMobileTutorialModalWithNewInstruction('Thank you for your attention!');
        } else {
            document.getElementById('place-of-tooltip').removeChild(tooltipSpan);
            window.removeEventListener('mousemove', app.tutorial.tooltipPositioning);   
        }
        app.tutorial.activateMenus();
        app.tutorial.moveLeftTutorialSwitch();
        app.mapHandling.addEventListenersToCountries();
        app.tutorial.activateTutorialSwitch();
        app.menuHandling.setFirstMenuToActive();
    },

    openMobileTutorialModalWithNewInstruction: function(newText) {
        $('#tutorialModal').modal('toggle');
        var textParagraph = document.getElementById('tutorial-text');
        textParagraph.innerHTML = newText;
    }
}