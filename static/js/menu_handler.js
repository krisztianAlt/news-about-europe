var app = app || {};

app.menu_handling = {

    set_first_menu_to_active: function () {
        var menu_section = document.getElementById("navbarSupportedContent");
        var menus = menu_section.getElementsByClassName("nav-item");
        menus.item(0).className += " active";
    },


    active_menu_button_color: function () {

        /*$('li').click(function(e) {   
            e.preventDefault();
            $('li').removeClass('active');
            $(this).addClass('active');
        });*/


        var menu_section = document.getElementById("navbarSupportedContent");
        var menus = menu_section.getElementsByClassName("nav-item");
        for (var index = 0; index < menus.length; index++) {
            console.log(menus.item(index));
            menus.item(index).addEventListener("click", function(event) {
                event.preventDefault()
                var current = document.getElementsByClassName("active");
                current[0].className = current[0].className.replace(" active", "");
                this.className += " active";
            });
        };
    },

    set_reuters_radio_to_checked: function () {
        var radio_section = document.getElementById("news-agency-selector-area");
        var news_agencies = radio_section.getElementsByClassName("form-check-input");
        news_agencies.item(4).checked = true;
    }
}