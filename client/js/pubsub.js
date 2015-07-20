/**
 * Event manager used for communication between modules.
 */
(function PubSub(app) {
    'use strict';
    var events = {};

    /**
     * Registers a new event.
     * @param {String} name a unique event name
     * @param {Function} cb callback to be invoked upon event firing
     */
    function subscribe(name, cb) {
        events[name] = cb;
    }

    /**
     * Removes the event with the specified name from the event bus.
     * @param {String} name the name of the event to be removed
     */
    function unsubscribe(name) {
        events[name] = undefined;
    }

    /**
     * Invokes the callback of the the event with the specified name.
     * @param {String} name the name of the event name
     * @param {Object} data client to be passed to the event handler
     */
    function publish(name, data) {
        if (events[name]) {
            events[name](data);
        }
    }

    app.eventBus = {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish,

        eventNames: {
            // publisher: pagination
            pagingSizeChanged: 'pagingSizeChanged',
            pageBtnClicked: 'pageBtnClicked',
            curPageChanged: 'curPageChanged',
            reloadItems: 'reloadItems',
            // publisher: cart
            resetItemAmount: 'resetItemAmount',
            // publisher: quantityButtons
            setItemAmountInCart: 'setItemCartAmount',
            addItemToCart: 'addItemToCart',
            removeItemFromCart: 'removeItemFromCart',
            // publisher: catalogue
            sortAscBtnClicked: 'sortAscBtnClicked',
            sortDescBtnClicked: 'sortDescBtnClicked',
            reloadPagination: 'reloadPagination'
            // + curPageChanged
        }
    };
}(app));
