var app = app || {};

app.init = function() {
    app.menuHandling.setFirstMenuToActive();
    app.menuHandling.setActiveMenuButtonColor();
    app.menuHandling.setReutersRadioToChecked();
    app.mapHandling.showMap();
    app.scrollerHandling.startScroller();
};

$(document).ready(app.init());