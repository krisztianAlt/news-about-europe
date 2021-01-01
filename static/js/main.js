var app = app || {};

app.init = function() {
    app.radioHandling.setReutersRadioToChecked();
    app.mapHandling.activateCountriesOnMap();
    app.scrollerHandling.startScroller();
    app.tutorial.activateTutorialSwitch();
};

$(document).ready(app.init());