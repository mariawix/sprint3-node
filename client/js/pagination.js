/**
 * Loads pagination module into the app.
 */
define(function (require) {
    'use strict';
    var pageBtnClass = 'page-btn',
        curPageBtnClass = 'current-page-btn',
        pageLinkClass = 'page-link',

        eventBus = require('pubsub'),
        view = require('view'),

        paginationListElement = document.querySelector('.pagination-list'),
        pagingSizeElement = document.querySelector('.paging-size');

    /**
     * Initializes pagination module.
     * @param {Number} itemsNmb overall number of items
     */
    function init(itemsNmb) {
        subscribePaginationEventHandlers();
        loadPaginationBar(1, itemsNmb);
        handlePagingSizeChange(itemsNmb);
    }

    /**************************************************************************************************
     *                                          UI Manipulations
     **************************************************************************************************/
    /**
     * Subscribes all pagination related event handlers to the pubsub.
     */
    function subscribePaginationEventHandlers() {
        eventBus.subscribe(eventBus.eventNames.curPageChanged, function (curPageNmb) {
            view.getElementByClassName(paginationListElement, curPageBtnClass).classList.remove(curPageBtnClass);
            view.getElementByClassName(paginationListElement, pageBtnClass + ':nth-child(' + curPageNmb + ')').classList.add(curPageBtnClass);
        });

        eventBus.subscribe(eventBus.eventNames.reloadPagination, function() {
            eventBus.publish(eventBus.eventNames.reloadItems, getPagingSize());
        });
    }

    /**
     * Handles paging size change event.
     * @param {Number} itemsNmb total number of items
     */
    function handlePagingSizeChange(itemsNmb) {
        pagingSizeElement.onchange = function () {
            eventBus.publish(eventBus.eventNames.pagingSizeChanged, getPagingSize());
            loadPaginationBar(getCurPageNmb(), itemsNmb);
        };
    }

    /**
     * Handles page button click event.
     * @param {Element} pageBtnElement a page button element
     */
    function handlePageBtnClick(pageBtnElement) {
        pageBtnElement.onclick = function () {
            var data = JSON.parse(pageBtnElement.datasets.paging), clickedPage, clickedPageNmb;
            clickedPage = view.getElementByClassName(pageBtnElement, pageLinkClass);
            clickedPageNmb = parseInt(clickedPage.innerText, 10);
            eventBus.publish(eventBus.eventNames.pageBtnClicked, {start: data.start, end: data.end});
            eventBus.publish(eventBus.eventNames.curPageChanged, clickedPageNmb);
        };
    }

    /**************************************************************************************************
     *                                           DOM Helpers
     **************************************************************************************************/
    /**
     * Returns number of the currently displayed page.
     * @returns {Number} index of the current page
     */
    function getCurPageNmb() {
        var curPageBtn, curPageLink, curPageNmb;
        curPageBtn = view.getElementByClassName(paginationListElement, curPageBtnClass);
        curPageLink = view.getElementByClassName(curPageBtn, pageLinkClass);
        curPageNmb = parseInt(curPageLink.innerText, 10);
        return isNaN(curPageNmb) ? 1 : curPageNmb;
    }
    /**
     * Returns number of items displayed on a single page.
     * @returns {Number} number of items displayed on a single page.
     */
    function getPagingSize() {
        return parseInt(pagingSizeElement.value, 10);
    }

    /**
     * Creates a page button element.
     * @param {Boolean} curPage true if created button corresponds to the currently displayed page, false - otherwise.
     * @param {Number} pageIndex page button index
     * @param {Number} pagingSize number of items displayed on a single page
     * @returns {Element} the newly created button
     */
    function createPageBtnElement(curPage, pageIndex, pagingSize) {
        var firstItemIndex = (pageIndex - 1) * pagingSize,
            endItemIndex = pageIndex * pagingSize,
            pageItemAtts, className, btn;
        className = pageBtnClass;
        if (curPage) {
            className += ' ' + curPageBtnClass;
        }
        pageItemAtts = {
            'className': className,
            'datasets': { 'paging': '{"start": ' + firstItemIndex + ', "end": ' + endItemIndex + '}' }
        };
        btn = view.createCustomElement('li', pageItemAtts);
        view.appendChild(btn, 'span', {'className': pageLinkClass, 'innerText': pageIndex});
        return btn;
    }

    /**
     * Loads pagination bar.
     * @param {Number} curPage index of the displayed page
     * @param {Number} itemsNmb total number of items
     */
    function loadPaginationBar(curPage, itemsNmb) {
        var pageNmb, btn, pagingFragment = document.createDocumentFragment(),
            pagingSizeValue = (pagingSizeElement.value < itemsNmb) ? pagingSizeElement.value : itemsNmb;
        paginationListElement.innerHTML = '';
        for (pageNmb = 1; (pageNmb - 1) * pagingSizeValue < itemsNmb; pageNmb++) {
            btn = createPageBtnElement(pageNmb === curPage, pageNmb, pagingSizeValue);
            pagingFragment.appendChild(btn);
            handlePageBtnClick(btn);
        }
        paginationListElement.appendChild(pagingFragment);
    }

    return {
        init: init,
        getPagingSize: getPagingSize
    };
});
