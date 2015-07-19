/*global view*/
/*
 * Quantity Buttons Helpers
 */
var quantityButtons = (function() {
    "use strict";
    var quantityBtnsContainerClass = "item-amount",
        itemAmountInputClass = "amount",
        addToCartBtnClass = "add",
        removeFromCartBtnClass = "remove",

        eventBus = app.eventBus;

    /**
     * Creates an add to cart button.
     * @param {Object} data object of the form {item: item, itemAmountElement: itemAmountElement}, passed to the click callback
     * @returns {Element} the newly created button
     */
    function createAddBtn(data) {
        var btn, btnAtts = {"className": addToCartBtnClass, "innerText": "Add"};
        btn = view.createCustomElement("button", btnAtts);
        btn.onclick = function(e) {
            e.preventDefault();
            var amountAdded = parseInt(data.itemAmountElement.value, 10);
            if (!isNaN(amountAdded) && amountAdded < data.item.quantity) {
                data.itemAmountElement.value = amountAdded + 1;
                eventBus.publish(eventBus.eventNames.addItemToCart, data);
            }
        };
        return btn;
    }

    /**
     * Creates a remove from cart button.
     * @param {Object} data object of the form {item: item, itemAmountElement: itemAmountElement}, passed to the click callback
     * @returns {Element} the newly created button
     */
    function createRemoveBtn(data) {
        var btn, btnAtts = {"className": removeFromCartBtnClass, "innerText": "Remove"};
        btn = view.createCustomElement("button", btnAtts);
        btn.onclick = function(e) {
            e.preventDefault();
            var itemAmount = parseInt(data.itemAmountElement.value, 10);
            if (!isNaN(itemAmount) && itemAmount > 0) {
                data.itemAmountElement.value = itemAmount - 1;
                eventBus.publish(eventBus.eventNames.removeItemFromCart, data);
            }
        };
        return btn;
    }

    /**
     * Creates an item amount input field.
     * @param {Object} item an item object corresponding to this button
     * @returns {Element} the newly created button
     */
    function createItemAmountElement(item) {
        var atts = {"className": itemAmountInputClass, "value": 0},
            itemAmountElement;
        if (item.quantity === 0) {
            atts.disabled = "true";
        }
        itemAmountElement = view.createCustomElement("input", atts);
        eventBus.subscribe(eventBus.eventNames.resetItemAmount + item.id, function() {
            itemAmountElement.value = 0;
        });
        itemAmountElement.onchange = function(e) {
            e.preventDefault();
            var itemAmount = parseInt(itemAmountElement.value, 10);
            if (isNaN(itemAmount) || itemAmount < 0 || itemAmount > item.quantity) {
                itemAmount = 0;
            }
            itemAmountElement.value = itemAmount;
            eventBus.publish(eventBus.eventNames.setItemAmountInCart, {"item": item, "amount": itemAmount});
        };
        return itemAmountElement;
    }

    /**
     * Appends quantity buttons to the specified parent element.
     * @param {Element} parentElement a reference to a parent element to append buttons to
     * @param {Object} item an item object corresponding to the created buttons
     */
    function appendQuantityBtns(parentElement, item) {
        var itemAmountElement, container, data;
        container = view.appendChild(parentElement, "span", {"className": quantityBtnsContainerClass});
        itemAmountElement = createItemAmountElement(item);
        container.appendChild(itemAmountElement);
        data = {"itemAmountElement": itemAmountElement, "item": item};
        container.appendChild(createAddBtn(data));
        container.appendChild(createRemoveBtn(data));
    }

    return {
        appendQuantityBtns: appendQuantityBtns
    };
}());
