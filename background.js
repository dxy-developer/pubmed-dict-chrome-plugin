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
            var keys = '_' + words, data = localStorage.getItem(keys);
            if (data) {
                return {error: 0, data: JSON.parse(data)};
            } else {
                return {error: 1, type: null, xhr: null};
            }
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
                return localStorage.clear();
            },

            isCached: function(words) {
                var data = fetchFromCache(words);
                return (data.error) ? false : true;
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
            console.info("Cache words '"+ words +"' hited, get from localStorage.")
            return callback(Cacher.fetchFromCache(words));
        }

        Zepto.ajax({
            type: 'GET',
            url: getRequestUrl(words),
            dataType: 'json',
            timeout: 2000,
            success: function(data) {
                Cacher.saveToCache(words, data);
                callback({error: 0, data: data});
            },
            error: function(xhr, type){
                console.error(xhr, type);
                callback({error: 1, xhr: xhr, type: type});
            }
        });
    }


    sogouExplorer.extension.onConnect.addListener(function(port) {
        console.info('AddListener is started.');
        port.onMessage.addListener(function(msg) {
            console.info('Recived message ' + msg.words);
            fetchTranslate(msg.words, function(data) {
                port.postMessage(data);
            });
        });
    });


    // Bind Message Listener
    sogouExplorer.extension.onMessage.addListener (
        function(message, sender, sendResponse) {
            /*
            if (message.words) {
                fetchTranslate(message.words, function(data) {
                    console.info(data);
                    sendResponse(data);
                });
            }
            */
            
            if (message.storage) {
                var key = message.storage, value = message.value, method = message.method;
                switch(method) {
                    case "set":
                        localStorage.setItem("_" + key + "_", value);
                        break;

                    case "get":
                        value = localStorage.getItem("_" + key + "_");
                        break;

                    case "clear":
                        localStorage.clear();
                        break;
                }

                sendResponse(value);
            }
    });

    // Bind to global cscope
    cscope.fetchTranslate = fetchTranslate;
    cscope.Cacher = Cacher;
} (window);
