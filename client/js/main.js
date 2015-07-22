define(function (require) {
    'use strict';
    var utils = require('utils'),
        catalog = require('catalog'),
        pagination = require('pagination'),
        cart = require('cart');

    function run(items) {
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
        var switchThemeBtn = document.querySelector('.switch-theme-btn'),
            body = document.querySelector('body');
        switchThemeBtn.onclick = function (e) {
            e.preventDefault();
            if (body.classList.contains('default-theme')) {
                body.classList.remove('default-theme');
                body.classList.add('green-theme');
            } else {
                body.classList.add('default-theme');
                body.classList.remove('green-theme');
            }
        };
    }

    utils.sendRequest('GET', '/getItems', '', run);

});
