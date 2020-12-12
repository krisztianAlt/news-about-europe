var app = app || {};

app.menuHandling = {

    setFirstMenuToActive: function () {
        var menuSection = document.getElementById("navbarSupportedContent");
        var menus = menuSection.getElementsByClassName("nav-item");
        menus.item(0).className += " active";
    },


    setActiveMenuButtonColor: function () {

        /*$('li').click(function(e) {   
            e.preventDefault();
            $('li').removeClass('active');
            $(this).addClass('active');
        });*/


        var menuSection = document.getElementById("navbarSupportedContent");
        var menus = menuSection.getElementsByClassName("nav-item");
        for (var index = 0; index < menus.length; index++) {
            menus.item(index).addEventListener("click", function(event) {
                event.preventDefault();
                var current = document.getElementsByClassName("active");
                current[0].className = current[0].className.replace(" active", "");
                this.className += " active";
            });
        };
    },

    setReutersRadioToChecked: function () {
        var radioSection = document.getElementById("news-agency-selector-area");
        var newsAgencies = radioSection.getElementsByClassName("form-check-input");
        newsAgencies.item(4).checked = true;
    }
}