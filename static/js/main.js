var app = app || {};

app.init = function() {
    app.menuHandling.setFirstMenuToActive();
    app.menuHandling.setActiveMenuButtonColor();
    app.menuHandling.setReutersRadioToChecked();
    app.mapHandling.showMap();
};

$(document).ready(app.init());