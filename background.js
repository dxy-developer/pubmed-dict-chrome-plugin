// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-02-21
 * @link   http://www.gracecode.com/
 */

~function(cscope) {
    /**
     * Cacher, cache by localStorage
     */
    var Cacher = (function() {
        var fetchFromCache = function(words) {
            var keys = '_' + words;
            return JSON.parse(localStorage.getItem(keys));
        };

        var saveToCache = function(words, data) {
            try {
                var keys = '_' + words;
                localStorage.setItem(keys, JSON.stringify(data));
            } catch (e) {
                if (e == QUOTA_EXCEEDED_ERR) {
                    //data wasn't successfully saved due to quota exceed so throw an error
                    console.error('Quota exceeded!'); 
                }
            }
        };
        
        return {
            clear: function() {
                localStorage.clear();
            },

            isCached: function(words) {
                return !!fetchFromCache(words);
            },

            fetchFromCache: fetchFromCache,
            saveToCache: saveToCache
        }
    })();

    function getRequestUrl(word) {
        var baseUrl = 'http://dict.pubmed.cn/webservices/dict/openapi/3223231d'
        return baseUrl + "/" + encodeURIComponent(word) + '?t=' + (+new Date());
    }

    function fetchTranslate(words, callback)
    {
        if (Cacher.isCached(words)) {
            // if cache prisented
            var data = Cacher.fetchFromCache(words);
            return callback(data);
        }

        // send resquest to service
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(data) {
            if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != null) {
                var resp = JSON.parse(xhr.responseText);
                var data = {
                    _responseText: xhr.responseText,
                    data: resp
                };
                callback(data);
                Cacher.saveToCache(words, data);
            } else {
                callback(null);
            }
        }

        console.info('[NET] Request from ' + getRequestUrl(words));
        xhr.open('GET', getRequestUrl(words), true);
        xhr.send();	
    }

    // Bind Message Listener
    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(msg) {
            fetchTranslate(msg.words, function(data) {
                port.postMessage(data);
            });
        });
    });

    // Bind to global cscope
    cscope.fetchTranslate = fetchTranslate;
    cscope.Cacher = Cacher;
}(window);
