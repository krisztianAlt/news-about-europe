var app = app || {};

app.menu_handling = {

    add_active_class_to_first_menu: function () {
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
    }
}