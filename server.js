/**
 * Created by mariao on 7/17/15.
 */
(function () {
    var PORT = 8080, HOST = 'localhost', ROOT = './client',
        http = require('http'), fs = require('fs'), db = require('./db/db'),
        url = require('url'), querystring = require('querystring');

    db.init();

    http.createServer(function (req, res) {
        var uri = url.parse(req.url), method = req.method,
            pars = querystring.parse(uri.query), pathname = uri.pathname;
        switch (pathname) {
            case '/getItems':
                sendResponse('', JSON.stringify(db.getItems(pars.startIndex, pars.endIndex)), res);
                break;
            case '/getCouponByID':
                sendResponse('', JSON.stringify(db.getCouponByID(pars.couponID)), res);
                break;
            case '/transact':
                sendResponse('', JSON.stringify(db.transact(pars.itemsData, pars.couponIDs)), res);
                break;
            default:
                getFile(pathname, res);
        }
    }).listen(PORT, HOST);

    console.log('Server running at ' + HOST + ':' + PORT);

    /*******************************************************************************************************************
     *                                                      Helpers
     ******************************************************************************************************************/
    function sendResponse(err, data, res) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    }


    function getFile(path, res) {
        var fileName, pathLen, contentType;
        if (path === '/')
            path = '/index.html';
        fileName = ROOT + path;
        contentType = getContentType(path);
        pathLen = path.length;
        path.indexOf('.css', pathLen - 4) > 0
        fs.readFile(fileName, function (err, data) {
            res.setHeader('content-type', contentType + '; charset=utf-8');
            sendResponse(err, data, res);
        });
    }

    function getContentType(path) {
        var pathLen = path.length;
        if (path.indexOf('.js', pathLen - 3) > 0) {
            return 'text/javascript';
        }
        if (path.indexOf('.css', pathLen - 4) > 0) {
            return 'text/css';
        }
        if (path.indexOf('.ico', pathLen - 4) > 0) {
            return 'image/x-icon';
        }
        if (path.indexOf('.html', pathLen - 5) > 0) {
            return 'text/html';
        }
        return 'text/plain';
    }

})();
