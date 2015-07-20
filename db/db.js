/*eslint wrap-iife: [1, "outside"] */
/**
 * Database
 */
module.exports = (function () {
    'use strict';
    var itemsDB, couponsDB, root = './data';

    /*******************************************************************************************************************
     *                                                      Public API
     ******************************************************************************************************************/
    /**
     * Loads db.
     */
    function init() {
        itemsDB = initItems(require(root + '/items.json'));
        couponsDB = initCoupons(require(root + '/coupons.json'), itemsDB.items);
    }

    /**
     * Returns coupon by ID.
     * @param {String} couponID ID of coupon to search
     * @returns {Object} coupon if found
     */
    function getCouponByID(couponID) {
        var coupon;
        for (var i = 0; i < couponsDB.couponsNum; i++) {
            if (couponsDB.coupons[i].getID() === couponID) {
                coupon = couponsDB.coupons[i];
                if (coupon instanceof couponsDB.couponClasses.DiscountCoupon) {
                    return {couponID: coupon.getID(), discount: coupon.getDiscountValue()};
                }
                return {couponID: coupon.getID(), freeItem: coupon.getFreeItem()};
            }
        }
    }

    /**
     * Returns all the items.
     * @returns {Array} array of items
     */
    function getItems() {
        return itemsDB.items;
    }

    /**
     * Performs transaction.
     * @param {itemIDs: Array, itemAmount: Array} itemsData
     * @param {Array} couponsData
     * @returns {Boolean} true if the transaction succeeds, false - otherwise
     function transact(itemsData, couponIDs) {
        var item, i;
        for (i = 0; i < itemsData.itemIDs.length; i++) {
            // ...
            // ...
            // ...
            item = getItemByID(itemsData.itemIDs[i]);
            return (item) ? item.quantity -= itemsData.itemAmount[i] : false;
        }
        return true;
    }
     */

    /**
     * Returns item by ID.
     * @param {Number} itemID ID of item to search
     * @returns {Object} item if found, -1 otherwise
     */
    function getItemByID(itemID) {
        for (var i = 0; i < itemsDB.itemsNum; i++) {
            if (itemsDB.items[i].id === itemID) {
                return itemsDB.items[i];
            }
        }
    }

    /*******************************************************************************************************************
     *                                                      Helpers
     ******************************************************************************************************************/

    /**
     * Returns a random number in the range [minValue, maxValue) * factor.
     */
    function getRandomNum(minValue, maxValue, factor) {
        return Math.floor(Math.random() * maxValue + minValue) * factor;
    }

    /**
     * Returns a clone object of the given item instance.
     * @param {Object} item item instance to clone
     * @returns {Object} the clone object of the item
     */
    function getItemClone(item) {
        var i, itemClone = {}, propertyNames = Object.getOwnPropertyNames(item), propertyName;
        for (i = 0; i < propertyNames.length; i++) {
            propertyName = propertyNames[i];
            itemClone[propertyName] = item[propertyName];
        }
        return itemClone;
    }

    /**
     * Creates items from given json objects.
     * @param {Object} itemObjects item json objects
     * @returns {{items: Array, itemClasses: {Item: Item, OnSaleItem: OnSaleItem, OutOfStockItem: OutOfStockItem}}}
     */
    function initItems(itemObjects) {
        var keys = ['id', 'name', 'description', 'image', 'price', 'type', 'quantity', 'discount'],
            compoundItems = [], num, compoundItem, itemConstructors = [Item, OnSaleItem, OutOfStockItem];

        /**
         * Base item: random quantity, no discount.
         * @param {Object} itemProperties object specifying item properties: id, name, description etc.
         * @constructor
         */
        function Item(itemProperties) {
            var properties = {}, i;
            for (i = 0; i < keys.length; i++) {
                properties[keys[i]] = {configurable: false, enumerable: true, writable: false};
                properties[keys[i]].value = itemProperties[keys[i]];
            }
            properties.quantity.writable = true;
            Object.defineProperties(this, properties);
        }

        /**
         * Item on sale: discount > 0
         * @param {Object} itemProperties object specifying item properties: id, name, description etc.
         * @constructor
         */
        function OnSaleItem(itemProperties) {
            itemProperties.image = '/img/sale-item.ico';
            itemProperties.type = 'sale';
            itemProperties.quantity = getRandomNum(1, 9, 1);
            itemProperties.discount = getRandomNum(1, 7, 10);
            Item.call(this, itemProperties);
        }

        /**
         * Out of stock item: quantity = 0
         * @param {Object} itemProperties object specifying item properties: id, name, description etc.
         * @constructor
         */
        function OutOfStockItem(itemProperties) {
            itemProperties.image = '/img/out-of-stock-item.ico';
            itemProperties.type = 'out';
            itemProperties.quantity = 0;
            itemProperties.discount = 0;
            Item.call(this, itemProperties);
        }

        itemObjects.forEach(function (item) {
            num = getRandomNum(0, itemConstructors.length, 1);
            if (itemConstructors[num] === Item) {
                item.image = '/img/base-item.ico';
                item.type = 'base';
                item.quantity = getRandomNum(1, 5, 1);
                item.discount = 0;
            }
            compoundItem = new itemConstructors[num](item);
            compoundItems.push(compoundItem);
        });

        return {
            items: compoundItems,
            itemsNum: compoundItems.length
        };
    }

    /**
     * Creates coupons from given json objects.
     * @param {Object} couponObjects coupon json objects
     * @returns {{coupons: Array, couponClasses: {Coupon: Coupon, FreeItemCoupon: FreeItemCoupon, DiscountCoupon: DiscountCoupon}}}
     */
    function initCoupons(couponObjects, items) {
        var coupons = [], coupon, code, i;

        /**
         * Base class.
         * @param {String} id coupon code
         * @constructor
         */
        function Coupon(id) {
            var _id = id;
            this.getID = function () {
                return _id;
            };
        }

        /**
         * Free item coupon: gives an item with discount 100
         * @param {Object} item free item
         * @param {String} id coupon code
         * @constructor
         */
        function FreeItemCoupon(item, id) {
            Coupon.call(this, id);
            var _itemClone = getItemClone(item);
            _itemClone.discount = 100;
            this.getFreeItem = function () {
                return _itemClone;
            };
        }

        /**
         * Discount coupon: adds a discount to each item in the cart
         * @param {Number} discountValue discount (percent) added to each item
         * @param {String} id coupon code
         * @constructor
         */
        function DiscountCoupon(discountValue, id) {
            Coupon.call(this, id);
            var _discountValue = discountValue;
            this.getDiscountValue = function () {
                return _discountValue;
            };
        }

        /**
         * Generates a random coupon code of given length.
         */
        function getRandomCode() {
            var j, str = '';
            for (j = 0; j < 5; j++) {
                str += getRandomNum(0, 9, 1);
            }
            return str;
        }

        DiscountCoupon.prototype = Object.create(Coupon);
        DiscountCoupon.prototype.constructor = DiscountCoupon;

        FreeItemCoupon.prototype = Object.create(Coupon);
        FreeItemCoupon.prototype.constructor = FreeItemCoupon;

        for (i = 0; i < couponObjects.length; i++) {
            code = getRandomCode();
            console.log(code);
            coupon = (i % 2 === 0) ? new DiscountCoupon(getRandomNum(1, 7, 10), code) : new FreeItemCoupon(items[getRandomNum(0, items.length, 1)], code);
            coupons.push(coupon);
        }


        return {
            couponsNum: coupons.length,
            couponClasses: {Coupon: Coupon, DiscountCoupon: DiscountCoupon, FreeItemCoupon: FreeItemCoupon},
            coupons: coupons
        };
    }

    return {
        init: init,
        getCouponByID: getCouponByID,
        getItems: getItems,
        //transact: transact,
        getItemByID: getItemByID
    };
})();