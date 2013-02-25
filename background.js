// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-02-21
 * @link   http://www.gracecode.com/
 */

~function() {

    function getRequestUrl(word) {
        var baseUrl = "http://localhost/tmp/dict.json";
        return baseUrl + "?word=" + encodeURIComponent(word);
    }

    function fetchTranslate(words, callback)
    {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(data) {
            if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != null) {
                var resp = JSON.parse(xhr.responseText);
                callback(
                    {
                        _responseText: xhr.responseText,
                            data: resp
                    }
                );
            } else {
                callback(null);
            }
        }

        console.info('Send request to: ' + getRequestUrl(words));
        xhr.open('GET', getRequestUrl(words), true);
        xhr.send();	
    }

    // Bind Message Listener
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url : "from the extension");

            switch(request.command) {
                case 'search': 
                    fetchTranslate(request.words, sendResponse);
                    break;
            }

            return true;
    });

    window.fetchTranslate = fetchTranslate;
}();
