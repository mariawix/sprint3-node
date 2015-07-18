/**
 * DOM helpers.
 */
var view = (function() {
    var hiddenElementClass = 'visuallyhidden',
        tableHeadCellClass = 'th',
        tableBodyCellClass = 'td',
        tableHeadClass = 'thead',
        tableBodyClass = 'tbody',
        tableRowClass = 'tr';
    /**
     * Creates a new DOM element and appends it to the provided parent element.
     * @param {Element} parentElement the parent element of the newly created element
     * @param {String} tagName the tag name of the created element
     * @param {Object} attributes an object specifying attributes of the child element
     * @returns {Element} the newly created element
     */
    function appendChild(parentElement, tagName, attributes) {
        var attributeName, childElement;
        childElement = createCustomElement(tagName, attributes);
        parentElement.appendChild(childElement);
        return childElement;
    }

    /**
     * Creates a new element with the given tag name and attributes.
     * @param {String} tagName the tag name of the created element
     * @param {Object} attributes an object specifying attributes of the created element
     * @returns {Element} the newly created element
     */
    function createCustomElement(tagName, attributes) {
        var element = document.createElement(tagName), attKey, objKey;
        for (attKey in attributes) {
            if ((typeof attributes[attKey]) === 'object') {
                for (objKey in attributes[attKey]) {
                    element[attKey][objKey] = attributes[attKey][objKey];
                }
            }
            else {
                element[attKey] = attributes[attKey];
            }
        }
        return element;
    }

    /**
     * Returns a child element with given class name, contained inside specified parent element.
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
     * @param {Function} appendSortBtns a callback function appending sort buttons to header cells
     */
    function loadTableHead(tableElement, headerContent, appendSortBtns) {
        var row = createCustomElement('div', {'className': tableRowClass}),
            tableHeadElement = getElementByClassName(tableElement, tableHeadClass);

        /**
         * Appends a header cell to the given head row.
         * @param {Element} row a row element
         * @param {String} content text content of the created header cell
         * @param {Function} appendSortBtns a callback function appending sort buttons to the header cell
         */
        function appendHeaderCell(row, content, appendSortBtns) {
            var headerCell,
                headerCellAttributes =  {
                    'innerText': content,
                    'className': tableHeadCellClass + ' ' + content
                };
            headerCell = appendChild(row, 'div', headerCellAttributes);
            appendSortBtns(headerCell, content, true);
            appendSortBtns(headerCell, content, false);
        }

        headerContent.forEach(function(header) {
            appendHeaderCell(row, header, appendSortBtns);
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
        tableBodyElement.innerHTML = "";
        for (rowIndex = firstIndex; rowIndex < endIndex; rowIndex++) {
            tableBodyElement.appendChild(rows[rowIndex]);
        }
        tableElement.appendChild(tableBodyElement);
    }

    /**
     * Returns element value by its class name.
     * @param {Element} parentElement a reference to a parent element
     * @param {String} className class name of the element to search for
     * @returns value of element with the provided class name
     */
    function getElementValueByClassName(parentElement, className) {
        var val = getElementByClassName(parentElement, className).innerText, valNmb;
        valNmb = parseInt(val, 10);
        return (isNaN(valNmb)) ? val : valNmb;
    }

    /**
     * Returns the first body row of the specified table
     * @param {Element} tableElement a table element containing the row
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
     * @param {Function} appendCellContent a callback function to run to append content to cells
     */
    function createRowElements(objects, keys, appendCellContent) {
        var i, rowElement, rowElements = [];
        /**
         * Creates a row element.
         * @param {Object} obj object corresponding to the row
         * @param {Number} index row index
         * @param {Function} appendCellContent a callback function to run to append content to cells
         */
        function createRowElement(keys, obj, index, appendCellContent) {
            var rowElementClass = tableRowClass + ' ' + obj.type,
                rowElement = createCustomElement('div', {'className': rowElementClass, 'dataset': {'index': index}});
            keys.forEach(function(key) {
                var className = key + ' ' + tableBodyCellClass,
                    cell = appendChild(rowElement, 'div', {'className': className});
                appendCellContent(key, obj, cell);
            });
            return rowElement;
        }

        for (i = 0; i < objects.length; i++) {
            rowElement = createRowElement(keys, objects[i], i, appendCellContent);
            rowElements.push(rowElement);
        }
        return rowElements;
    }

    /**
     * Exposes hidden elements.
     * @param {Array} elements array of hidden elements
     */
    function exposeElements(elements) {
        elements.forEach(function(element) {
            if (element.classList.contains(hiddenElementClass)) {
                element.classList.remove(hiddenElementClass);
            }
        });
    }

    /**
     * Hides elements
     * @param {Array} elements array of elements to hide
     */
    function hideElements(elements) {
        elements.forEach(function(element) {
            if (!element.classList.contains(hiddenElementClass)) {
                element.classList.add(hiddenElementClass);
            }
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
    }
}());