// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-02-21
 * @link   http://www.gracecode.com/
 */

~function() {

    function fetchTranslate(words, callback)
    {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(data) {
            if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != null) {
                //var resp = JSON.parse(xhr.responseText);
                console.info(xhr.responseText);
                callback(
                    {data: xhr.responseText }
                );
            } else {
                //callback(null);
            }
        }

        var url = "http://fanyi.youdao.com/translate?client=deskdict&keyfrom=chrome.extension&xmlVersion=1.1&dogVersion=1.0&ue=utf8&i="+encodeURIComponent(words)+"&doctype=xml";
        xhr.open('GET', url, true);
        xhr.send();	
    }


    // Bind Message Listener
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {

            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
            "from the extension");

            if (request.word == "hello") {
                //sendResponse({farewell: "goodbye"});
                console.info('fetch');
                fetchTranslate('hello', sendResponse);
            }

            return true;
    });
}();
