/**
 * Created by mariao on 7/17/15.
 */
(function(){
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
        var fileName = (path === '/') ? ROOT + '/index.html' : ROOT + path;
        fs.readFile(fileName, function(err, data) {
            sendResponse(err, data, res);
        });
    }

})();
