var app = app || {};

app.radioHandling = {

    setReutersRadioToChecked: function () {
        var radioSection = document.getElementById("news-agency-selector-area");
        var newsAgencies = radioSection.getElementsByClassName("form-check-input");
        newsAgencies.item(3).checked = true;
    }
    
}