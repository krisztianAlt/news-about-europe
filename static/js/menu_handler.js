var app = app || {};

app.menuHandling = {

    setFirstMenuToActive: function () {
        var menuSection = document.getElementById("navbarSupportedContent");
        var menus = menuSection.getElementsByClassName("nav-item");
        menus.item(0).className += " active";
        if (menus.item(1).className.includes("active")) {
            menus.item(1).className = menus.item(1).className.replace(" active", "");
        }
    },


    setActiveMenuButtonColor: function () {
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
        newsAgencies.item(3).checked = true;
    }
}