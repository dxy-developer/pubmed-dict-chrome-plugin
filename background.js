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
                    console.error('Quota exceeded! Clear...'); 
                    localStorage.clear();
                }
            }
        };
        
        return {
            clear: function() {
                return localStorage.clear();
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

    var timer = false;
    function fetchTranslate(words, callback, error) {
        if (timer) {
            clearTimeout(timer)
        }

        if (Cacher.isCached(words)) {
            // if cache prisented
            console.info("Cache words '"+ words +"' hited, get from localStorage.")
            return callback(Cacher.fetchFromCache(words));
        }

        var requestUrl = getRequestUrl(words);
            // requestUrl = "http://localhost/test.php";

        timer = setTimeout(function() {
            console.info('[NET] Request from ' + getRequestUrl(words));
            // send resquest to service
            Zepto.ajax({
                //type: 'GET',
                url: requestUrl,
                dataType: 'json',
                timeout: 3000,
                success: function(resp) {
                    //console.info(resp);
                    var data = {
                        _responseText: resp.toString(), data: resp
                    };

                    Cacher.saveToCache(words, resp);
                    callback(data);
                },
                error: function(xhr, type){
                    console.error(xhr, type);
                    if (error) {
                        alert(data);
                    }
                }
            });
        }, 5);
    }

    // Bind Message Listener
    console.log('AddListener is started.');
    chrome.extension.onConnect.addListener(function(port) {
        console.info('AddListener is started.');
        port.onMessage.addListener(function(msg) {
            console.info('Recived message ' + msg.words);
            fetchTranslate(msg.words, function(data) {
                port.postMessage(data);
            }, function() {
                port.postMessage({
                    error: 1
                });
            });
        });
    });

    /**
     * Create a context menu
     */
    chrome.contextMenus.create({
        "id": "DxyDictSearcher",
        "title" : chrome.i18n.getMessage("searchWithDXYDict"),
        "type" : "normal",
        "contexts" : ["selection"]
    });

    chrome.contextMenus.onClicked.addListener(function(info, tab) {
        var selectionText = info.selectionText || false;
        console.log("Context menu has selected text '" + selectionText + "'");
        if (selectionText && selectionText.length) {
            chrome.tabs.create({
                url: "http://dict.pubmed.cn/"+ encodeURIComponent(selectionText) +".htm"
            });
        }
    });

    // Bind to global cscope
    cscope.fetchTranslate = fetchTranslate;
    cscope.Cacher = Cacher;
} (window);
