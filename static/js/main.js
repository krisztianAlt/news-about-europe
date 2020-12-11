var app = app || {};

app.init = function() {
    app.menu_handling.add_active_class_to_first_menu();
    app.menu_handling.active_menu_button_color();
    app.map_handling.show_map();
};

$(document).ready(app.init());