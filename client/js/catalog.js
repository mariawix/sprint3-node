/*
 * Loads catalogue module into the app
 */
(function(app) {
    'use strict';
    var sortAscBtnClass = 'sort-asc-btn',
        sortDescBtnClass = 'sort-desc-btn',

        eventBus = app.eventBus,

        tableElement = document.querySelector('.catalog'),
        headers = ['id', 'name', 'description', 'image', 'price', 'cart'],

        itemRowElements = [];

    /**
     * Creates item row elements, initializes the table and subscribes event handlers to the event bus.
     * @param {Array} items item objects
     */
    function init(items) {
        itemRowElements = view.createRowElements(items, headers, appendBodyCellContent);
        view.loadTableHead(tableElement, headers, appendSortBtn);
        subscribeCatalogEventHandlers();
    }
    /**
     * Reindexes item row elements
     */
    function reindexItemRowElements() {
        _.forEach(itemRowElements, function(itemRowElement, itemIndex) {
            itemRowElement.datasets.index = itemIndex;
        });
    }

    /**
     * Sorts item row elements
     * @param {Object} data object of the form {asc: Boolean}, if true - then sorts in ascending order, otherwise - descending
     */
    function sortItemRowElements(data) {
        itemRowElements.sort(function(item1, item2) {
            var el1val = view.getElementValueByClassName(item1, data.key),
                el2val = view.getElementValueByClassName(item2, data.key),
                res;
            res = (el1val > el2val) ? 1 : -1;
            //res = (el1val > el2val) ? 1 : ((el1val < el2val) ? -1 : 0);
            return (data.asc) ? res : -res;
        });
        reindexItemRowElements();
        eventBus.publish(eventBus.eventNames.reloadPagination, {});
    }

    /**************************************************************************************************
     *                                          DOM Helpers
     **************************************************************************************************/
    /**
     * Loads items with indices [firstIndex, endIndex - 1] to the table.
     * @param {Number} firstIndex index of the first item row element to be loaded
     * @param {Number} endIndex index at which to end loading
     */
    function loadItems(firstIndex, endIndex) {
        view.loadRows(tableElement, itemRowElements, firstIndex, endIndex);
    }
    /**
     * Appends a sort button to the given element.
     * @param {Element} parentElement a parent element to append the button to
     * @param {String} key sorting property
     * @param {Boolean} asc sorting order, if true then ascending, otherwise - descending
     */
    function appendSortBtn(parentElement, key, asc) {
        var sortBtn, btnAtts, eventName;
        if (key !== 'image' && key !== 'cart') {
            eventName = (asc) ? eventBus.eventNames.sortAscBtnClicked : eventBus.eventNames.sortDescBtnClicked;
            btnAtts = (asc) ? {'innerHTML': '&uarr;', 'className': sortAscBtnClass}
                            : {'innerHTML': '&darr;', 'className': sortDescBtnClass};
            sortBtn = view.createCustomElement('span', btnAtts);
            sortBtn.onclick = function () {
                eventBus.publish(eventName, {key: key, asc: asc});
            };
            parentElement.appendChild(sortBtn);
        }
    }
    /**
     * Given a cell and the columns name containing it appends appropriate content to that cell.
     * @param {String} cellClass class name of the cell to append content to
     * @param {Object} item an item corresponding to this cell
     * @param {Element} cell an element corresponding to that item
     */
    function appendBodyCellContent(cellClass, item, cell) {
        switch (cellClass) {
            case 'image':
                view.appendChild(cell, 'img', {'src': item[cellClass], 'alt': 'image'});
                break;
            case 'cart':
                quantityButtons.appendQuantityBtns(cell, item);
                break;
            case 'price':
                if (item.discount > 0) {
                    view.appendChild(cell, 'span', {'innerText': item.price.toFixed(2), 'className': 'old-price'});
                }
                view.appendChild(cell, 'span', {'innerText': ((item.price * (100 - item.discount)) / 100).toFixed(2), 'className': 'new-price'});
                break;
            default :
                cell.innerText = item[cellClass];
        }
    }
    /**************************************************************************************************
     *                                          UI Manipulations
     **************************************************************************************************/
    /**
     * Updates catalogue on paging size change.
     * @param {Number} pagingSize new paging size
     */
    function handlePagingSizeChange(pagingSize) {
        var firstIndex, newCurPage, topRow, topRowIndex;
        topRow = view.getFirstBodyRow(tableElement);
        topRowIndex = parseInt(topRow.datasets.index, 10);
        newCurPage = Math.floor(topRowIndex / pagingSize) + 1;
        firstIndex = (newCurPage - 1) * pagingSize;
        loadItems(firstIndex, firstIndex + pagingSize);
        eventBus.publish(eventBus.eventNames.curPageChanged, newCurPage);
    }
    /**
     * Subscribes catalogue event handlers to the event bus.
     */
    function subscribeCatalogEventHandlers() {
        eventBus.subscribe(eventBus.eventNames.pageBtnClicked, function (data) {
            loadItems(data.start, data.end);
        });

        eventBus.subscribe(eventBus.eventNames.pagingSizeChanged, handlePagingSizeChange);
        eventBus.subscribe(eventBus.eventNames.reloadItems, function(itemsAmount) {
            loadItems(0, itemsAmount);
        });

        eventBus.subscribe(eventBus.eventNames.sortAscBtnClicked, sortItemRowElements);
        eventBus.subscribe(eventBus.eventNames.sortDescBtnClicked, sortItemRowElements);
    }

    app.catalog = {
        init: init,
        loadRows: loadItems
    };
}(app));
