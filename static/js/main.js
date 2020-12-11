var app = app || {};

app.init = function() {
    app.menu_handling.set_first_menu_to_active();
    app.menu_handling.active_menu_button_color();
    app.menu_handling.set_reuters_radio_to_checked();
    app.map_handling.show_map();
};

$(document).ready(app.init());