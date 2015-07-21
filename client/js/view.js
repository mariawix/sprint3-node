/*eslint wrap-iife: [1, "outside"] */
/*eslint guard-for-in: 1 */
/**
 * Common DOM helpers.
 */
view = (function () {
    'use strict';
    var hiddenElementClass = 'visuallyhidden',
        tableHeadCellClass = 'th',
        tableBodyCellClass = 'td',
        tableHeadClass = 'thead',
        tableBodyClass = 'tbody',
        tableRowClass = 'tr';

    /**
     * Creates a new element with the given tag name and attributes.
     * @param {String} tagName the tag name of the created element
     * @param {Object} attributes an object specifying attributes of the created element
     * @returns {Element} the newly created element
     */
    function createCustomElement(tagName, attributes) {
        return _.merge(document.createElement(tagName), attributes);
    }

    /**
     * Creates a new DOM element and appends it to the provided parent element.
     * @param {Element} parentElement the parent element of the newly created element
     * @param {String} tagName the tag name of the created element
     * @param {Object} attributes an object specifying attributes of the child element
     * @returns {Element} the newly created element
     */
    function appendChild(parentElement, tagName, attributes) {
        var childElement = createCustomElement(tagName, attributes);
        parentElement.appendChild(childElement);
        return childElement;
    }


    /**
     * Returns a child element with given class name, contained inside the specified parent element.
     * @param {Element} parentElement parent element to search in
     * @param {String} className class name of the child element
     * @returns {Element} child element if found, undefined - otherwise
     */
    function getElementByClassName(parentElement, className) {
        return parentElement.querySelector('.' + className);
    }

    /**
     * Loads header cells to the head of the table.
     * @param {Element} tableElement a table element to load the head into
     * @param {Array} headerContent header cells content
     * @param {Function} appendSortBtns (optional) a callback appending sort buttons to header cells,
     * gets 3 arguments: headerCellElement, headerCellElementInnerText, useAscendingOrder
     */
    function loadTableHead(tableElement, headerContent, appendSortBtns) {
        var row = createCustomElement('div', {'className': tableRowClass}),
            tableHeadElement = getElementByClassName(tableElement, tableHeadClass);

        function appendHeaderCell(txt) {
            var headerCellAtts = { 'innerText': txt, 'className': _.repeat(' ' + tableHeadCellClass, 2) + '-' + txt},
                headerCell = appendChild(row, 'div', headerCellAtts);
            if (appendSortBtns) {
                appendSortBtns(headerCell, txt, true);
                appendSortBtns(headerCell, txt, false);
            }
        }

        _.forEach(headerContent, function (header) {
            appendHeaderCell(header);
        });
        tableHeadElement.appendChild(row);
        tableElement.appendChild(tableHeadElement);
    }

    /**
     * Loads rows at indices [firstIndex, endIndex - 1] into the given table.
     * @param {Element} tableElement a table element to load rows into
     * @param {Array} rows row elements to be loaded
     * @param {Number} firstIndex index of the first row to be loaded
     * @param {Number} endIndex index at which to stop loading
     */
    function loadRows(tableElement, rows, firstIndex, endIndex) {
        var rowIndex, tableBodyElement = getElementByClassName(tableElement, tableBodyClass);
        endIndex = (endIndex < rows.length) ? endIndex : rows.length;
        tableBodyElement.innerHTML = '';
        for (rowIndex = firstIndex; rowIndex < endIndex; rowIndex++) {
            tableBodyElement.appendChild(rows[rowIndex]);
        }
        tableElement.appendChild(tableBodyElement);
    }

    /**
     * Returns value of the element with the specified class name.
     * @param {Element} parentElement a reference to a parent element
     * @param {String} className class name of the element to search for
     * @returns value of element with the provided class name
     */
    function getElementValueByClassName(parentElement, className) {
        var val = getElementByClassName(parentElement, className).innerText, valNmb = +val;
        return (isNaN(valNmb)) ? val : valNmb;
    }

    /**
     * Returns the first body row of the specified table
     * @param {Element} tableElement a table element
     * @returns {Element} the first row of the body element of the table element
     */
    function getFirstBodyRow(tableElement) {
        var tableBodyElement = getElementByClassName(tableElement, tableBodyClass);
        return getElementByClassName(tableBodyElement, tableRowClass + ':first-child');
    }

    /**
     * Creates row elements from objects.
     * @param {Array} objects objects corresponding to rows
     * @param {Array} keys object keys used as column names
     * @param {Function} appendCellContent a callback which appends cell content, gets 3 arguments: objectKey, object, cellElement
     */
    function createRowElements(objects, keys, appendCellContent) {

        function createRowElement(obj, rowNmb) {
            var rowElementClass = tableRowClass + ' ' + tableRowClass + '-' + obj.type,
                rowElement = createCustomElement('div', {'className': rowElementClass, 'datasets': {'index': rowNmb}});
            _.forEach(keys, function (key) {
                var className = key + ' ' + tableBodyCellClass,
                    cell = appendChild(rowElement, 'div', {'className': className});
                appendCellContent(key, obj, cell);
            });
            return rowElement;
        }

        return _.map(objects, function(object, index) { return createRowElement(object, index); });
    }

    /**
     * Exposes hidden elements.
     * @param {Array} elements array of hidden elements
     */
    function exposeElements(elements) {
        _.forEach(elements, function (element) {
            element.className = _.remove(element.classList, hiddenElementClass).join(" ");
        });
    }

    /**
     * Hides elements.
     * @param {Array} elements array of elements to hide
     */
    function hideElements(elements) {
        _.forEach(elements, function (element) {
            element.classList.add(hiddenElementClass);
        });
    }

    return {
        appendChild: appendChild,
        createCustomElement: createCustomElement,

        getElementByClassName: getElementByClassName,
        getElementValueByClassName: getElementValueByClassName,

        loadTableHead: loadTableHead,
        loadRows: loadRows,

        getFirstBodyRow: getFirstBodyRow,
        createRowElements: createRowElements,

        hideElements: hideElements,
        exposeElements: exposeElements
    };
}());
