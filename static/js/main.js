var app = app || {};

app.init = function() {
    app.menuHandling.setFirstMenuToActive();
    app.menuHandling.setActiveMenuButtonColor();
    app.menuHandling.setReutersRadioToChecked();
    app.mapHandling.activateCountriesOnMap();
    app.scrollerHandling.startScroller();
};

$(document).ready(app.init());