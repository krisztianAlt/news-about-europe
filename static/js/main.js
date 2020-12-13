var app = app || {};

app.init = function() {
    app.menuHandling.setFirstMenuToActive();
    app.menuHandling.setActiveMenuButtonColor();
    app.menuHandling.setReutersRadioToChecked();
    app.mapHandling.activateCountriesOnMap();
    app.scrollerHandling.startScroller();
    app.tutorial.activateTutorialSwitch();
};

$(document).ready(app.init());