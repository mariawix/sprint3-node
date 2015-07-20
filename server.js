/*eslint wrap-iife: [1, "outside"] */
/**
 * Server
 */
(function () {
    'use strict';
    var PORT = 3000, HOST = 'localhost', ROOT = './client',
        http = require('http'), fs = require('fs'), db = require('./db/db'),
        url = require('url'), querystring = require('querystring');

    /*******************************************************************************************************************
     *                                                      Helpers
     ******************************************************************************************************************/
    /**
     * Sends HTTP response.
     * @param {Object} err error
     * @param {String} data data to be sent
     * @param {Object} res HTTP response
     */
    function sendResponse(err, data, res) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    }

    /**
     * Gets a file name and returns an appropriate content type
     * @param {String} filename path
     * @returns {String} content type for the file
     */
    function getContentType(filename) {
        var pathLen = filename.length;
        if (filename.indexOf('.js', pathLen - 3) > 0) {
            return 'text/javascript';
        }
        if (filename.indexOf('.css', pathLen - 4) > 0) {
            return 'text/css';
        }
        if (filename.indexOf('.ico', pathLen - 4) > 0) {
            return 'image/x-icon';
        }
        if (filename.indexOf('.html', pathLen - 5) > 0) {
            return 'text/html';
        }
        return 'text/plain';
    }

    /**
     * Serves static requests.
     * @param {String} filename path to the file to be sent
     * @param {Object} res HTTP response object
     */
    function sendFile(filename, res) {
        var fileName, contentType;
        if (filename === '/') {
            filename = '/index.html';
        }
        fileName = ROOT + filename;
        contentType = getContentType(filename);
        fs.readFile(fileName, function (err, data) {
            res.setHeader('content-type', contentType + '; charset=utf-8');
            sendResponse(err, data, res);
        });
    }

    /*******************************************************************************************************************
     *                                                      Main
     ******************************************************************************************************************/
    db.init();

    http.createServer(function (req, res) {
        var uri = url.parse(req.url), method = req.method,
            pars = querystring.parse(uri.query), pathname = uri.pathname;
        switch (pathname) {
            case '/getItems':
                if (method === 'GET') {
                    sendResponse('', JSON.stringify(db.getItems()), res);
                }
                break;
            case '/getCouponByID':
                if (method === 'GET') {
                    sendResponse('', JSON.stringify(db.getCouponByID(pars.couponID)), res);
                }
                break;
            /*
            case '/transact':
                if (method === 'POST') {
                    sendResponse('', JSON.stringify(db.transact(pars.itemsData, pars.couponIDs)), res);
                }
                break;
            */
            default:
                if (method === 'GET') {
                    sendFile(pathname, res);
                }
        }
    }).listen(PORT, HOST);

    //console.log('Server running at ' + HOST + ':' + PORT);
})();
