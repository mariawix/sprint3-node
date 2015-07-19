(function (app) {
    "use strict";

    app.sendRequest = function(method, path, query, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            var responseText = "";
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                if (xmlhttp.responseText !== "") {
                    responseText = JSON.parse(xmlhttp.responseText);
                }
                callback(responseText);
            }
        };
        xmlhttp.open(method, path + "?" + query, true);
        xmlhttp.send();
    };

    function run(items) {
        var catalog = app.catalog,
            pagination = app.pagination,
            cart = app.cart;

        catalog.init(items);
        pagination.init(items.length);
        catalog.loadRows(0, pagination.getPagingSize());
        cart.init();
        handleSwitchThemeButton();
    }

    /**
     * Adds event listener to switch theme button click event.
     */
    function handleSwitchThemeButton() {
        var switchThemeBtn = document.querySelector(".switch-theme-btn"),
            body = document.querySelector("body");
        switchThemeBtn.onclick = function (e) {
            e.preventDefault();
            if (body.classList.contains("default-theme")) {
                body.classList.remove("default-theme");
                body.classList.add("green-theme");
            }
            else {
                body.classList.add("default-theme");
                body.classList.remove("green-theme");
            }
        };
    }

    app.sendRequest("GET", "/getItems", "", run);

}(app));
