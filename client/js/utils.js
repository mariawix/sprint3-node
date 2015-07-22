/**
 * Created by mariao on 7/22/15.
 */
define(function(require){
    function sendRequest(method, path, query, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            var responseText = '';
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                if (xmlhttp.responseText !== '') {
                    responseText = JSON.parse(xmlhttp.responseText);
                }
                callback(responseText);
            }
        };
        xmlhttp.open(method, path + '?' + query, true);
        xmlhttp.send();
    }

    return {
        sendRequest: sendRequest
    }
});