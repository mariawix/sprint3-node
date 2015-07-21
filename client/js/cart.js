/*eslint guard-for-in: 1 */
/*
 * Loads cart module into the app.
 */
(function (app) {
    'use strict';
    var NOT_FOUND = -1,
        eventBus = app.eventBus,

        itemsTableHeaders = ['id', 'name', 'price', 'amount', 'discount', 'total'],
        couponDiscount = 0,
        addedCoupons = [],
        addedItems = {};

    /**
     * Resets the cart.
     */
    function resetCart() {
        _.forIn(addedItems, function(item, id) {
            eventBus.publish(eventBus.eventNames.resetItemAmount + id, {});
        });
        addedItems = {};
        addedCoupons = [];
        couponDiscount = 0;
        refreshCart();
    }

    /**
     * Refreshes total cost.
     */
    function refreshTotalBill() {
        var totalBill = 0;
        _.forIn(addedItems, function(item) {
            totalBill += getItemPrice(item) * item.amount;
        });
        totalBill = totalBill.toFixed(2);
        setTotalBillValue(totalBill);
    }

    /**
     * Refreshes the whole cart.
     */
    function refreshCart() {
        var items = [];
        _.forIn(addedItems, function(item) {
            if (item.amount > 0) {
                items.push(item);
            }
        });
        reloadItemsTable(items);
        reloadCouponTable();
        refreshTotalBill();
    }

    /**
     * Returns item discount with respect to discounts of coupons added so far.
     * @param {Object} item an item to get discount for
     * @returns {Number} total discount on that item
     */
    function getDiscount(item) {
        var discount = item.discount + couponDiscount;
        return (discount > 100) ? 100 : discount;
    }

    /**
     * Returns item price after discount.
     * @param {Item} item an item to get price for
     * @returns {Number} price of that item after discount
     */
    function getItemPrice(item) {
        return +((item.price * (100 - getDiscount(item))) / 100).toFixed(2);
    }

    /**
     * Returns coupon index by coupon code
     * @param {String} couponCode id of a coupon
     * @returns {Object} index of the coupon with this id if found, NOT_FOUND - otherwise
     */
    function getCouponIndexByID(couponCode) {
        return _.findIndex(addedCoupons, {'couponID': couponCode});
    }

    /**
     * Validates coupon submitted by user and updates the cart accordingly.
     */
    function addCoupon() {
        var couponCode = popCouponCode();
        if (getCouponIndexByID(couponCode) !== NOT_FOUND) {
            return;
        }
        app.sendRequest('GET', '/getCouponByID', 'couponID=' + couponCode, function (coupon) {
            if (coupon !== '') {
                addedCoupons.push(coupon);
                if (coupon.discount) {
                    couponDiscount += coupon.discount;
                    couponDiscount = (couponDiscount > 100) ? 100 : couponDiscount;
                } else {
                    addItemToCart({item: coupon.freeItem});
                }
            }
            refreshCart();
        });
    }

    /**
     * Sets number of items added to the cart to the given value.
     * @param {Object} data object {item: item, amount: amount},
     * where item is the item to be removed, amount is its current ammount in the cart
     */
    function setItemAmount(data) {
        var item = data.item;
        if (!addedItems[item.id]) {
            addedItems[item.id] = _.clone(item);
        } else {
            setTotalBillValue(getTotalBillValue() - getItemPrice(item) * addedItems[item.id].amount);
        }
        setTotalBillValue(getTotalBillValue() + getItemPrice(item) * data.amount);
        addedItems[item.id].amount = data.amount;
        refreshCart();
    }

    /**
     * Adds a new item to the cart.
     * @param {Object} data object {item: item, amount: amount},
     * where item is the item to be removed, amount is its current ammount in the cart
     */
    function addItemToCart(data) {
        var item = data.item;
        if (!addedItems[item.id]) {
            addedItems[item.id] = _.clone(item);
            addedItems[item.id].amount = 0;
        }
        addedItems[item.id].amount++;
        refreshCart();
    }

    /**
     * Removes an item from the cart.
     * @param {Object} data object {item: item, amount: amount},
     * where item is the item to be removed, amount is its current ammount in the cart
     */
    function removeItemFromCart(data) {
        addedItems[data.item.id].amount = addedItems[data.item.id].amount - 1;
        refreshCart();
    }
    
    /**************************************************************************************************
     *                                               UI Manipulations
     **************************************************************************************************/
    var couponSubmitBtn = document.querySelector('.coupon-submit-btn'),
        resetCartBtn = document.querySelector('.reset-cart-btn'),
        viewCartBtn = document.querySelector('.view-cart-btn'),
        hideCartBtn = document.querySelector('.hide-cart-btn');

    /**
     * Adds all cart event handlers.
     */
    function addEventListeners() {
        hideCartBtn.addEventListener('click', function (e) {
            e.preventDefault();
            hideCart();
        });
        resetCartBtn.addEventListener('click', function (e) {
            e.preventDefault();
            resetCart();
        });
        viewCartBtn.addEventListener('click', function (e) {
            e.preventDefault();
            exposeCart();
            refreshCart();
        });
        couponSubmitBtn.addEventListener('click', function (e) {
            e.preventDefault();
            addCoupon();
        });

        eventBus.subscribe(eventBus.eventNames.addItemToCart, addItemToCart);
        eventBus.subscribe(eventBus.eventNames.removeItemFromCart, removeItemFromCart);
        eventBus.subscribe(eventBus.eventNames.setItemAmountInCart, setItemAmount);
    }

    /**************************************************************************************************
     *                                              DOM Helpers
     **************************************************************************************************/
    var couponInputField = document.querySelector('.coupon-input'),
        couponInputContainer = document.querySelector('.coupon-input-container'),
        cartDetails = document.querySelector('.cart-details'),
        itemsTableElement = document.querySelector('.cart-table'),
        couponTableElement = document.querySelector('.coupon-table'),
        totalBillElement = document.querySelector('.total-bill'),

        couponTableHeaders = ['code', 'details'];

    /**
     * Initializes cart tables.
     */
    function initTables() {
        view.loadTableHead(itemsTableElement, itemsTableHeaders);
        view.loadTableHead(couponTableElement, couponTableHeaders);
    }

    /**
     * Reloads items table.
     * @param {Array} items items added to the cart so far.
     */
    function reloadItemsTable(items) {
        var rows = view.createRowElements(items, itemsTableHeaders, appendItemsTableCellContent);
        view.loadRows(itemsTableElement, rows, 0, items.length);
    }

    /**
     * Appends a content to the given cart table cell.
     * @param {String} cellClass class name of the cell to append content to
     * @param {Object} item an item object corresponding to this cell
     * @param {Element} cell an element corresponding to that item
     */
    function appendItemsTableCellContent(cellClass, item, cell) {
        switch (cellClass) {
            case 'total':
                cell.innerText = String((getItemPrice(item) * item.amount).toFixed(2));
                break;
            case 'discount':
                cell.innerText = getDiscount(item);
                break;
            default:
                cell.innerText = item[cellClass];
        }
    }

    /**
     * Reloads the coupon table.
     */
    function reloadCouponTable() {
        var rows = view.createRowElements(addedCoupons, couponTableHeaders, appendCouponTableCellContent);
        view.loadRows(couponTableElement, rows, 0, addedCoupons.length);
    }

    /**
     * Appends a content to the given coupon table cell.
     * @param {String} cellClass class name of the cell to append content to
     * @param {Object} coupon coupon object corresponding to this cell
     * @param {Element} cell an element corresponding to that coupon
     */
    function appendCouponTableCellContent(cellClass, coupon, cell) {
        switch (cellClass) {
            case 'code':
                cell.innerText = coupon.couponID;
                break;
            default:
                if (coupon.freeItem) {
                    cell.innerText = 'Free item ID: ' + coupon.freeItem.id;
                } else {
                    cell.innerText = 'Discount val: ' + coupon.discount;
                }
        }
    }

    /**
     * Hides the cart.
     */
    function hideCart() {
        view.hideElements([hideCartBtn, cartDetails, couponInputContainer]);
        view.exposeElements([viewCartBtn]);
    }

    /**
     * Shows the cart.
     */
    function exposeCart() {
        view.exposeElements([cartDetails, hideCartBtn, couponInputContainer]);
        view.hideElements([viewCartBtn]);
    }

    /**
     * Returns coupon code entered by user and resets coupon input field.
     * @returns {String} coupon code
     */
    function popCouponCode() {
        var couponCode = couponInputField.value;
        couponInputField.value = '';
        return couponCode;
    }

    /**
     * Returns total bill value.
     * @returns {Number} total bill.
     */
    function getTotalBillValue() {
        return +totalBillElement.value;
    }

    /**
     * Sets total bill value
     * @param {Number} value new value
     */
    function setTotalBillValue(value) {
        totalBillElement.value = value;
    }

    app.cart = {
        init: function () {
            initTables();
            addEventListeners();
        }
    };

}(app));
