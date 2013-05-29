~function(cscope) {
    var sendMessage = sogouExplorer.extension.sendMessage;
    var get = (function() {
        return function(key, defVal, callback) {
            sendMessage({storage: key, method: "get"}, function(response) {
                callback && callback(response ? response : defVal);
            });
        }
    })();

    var getAll = function(callback) {
        return null;
    }

    var set = function(key, value, callback) {
        sendMessage({storage: key, value: value, method: "set"}, function(response) {
            callback && callback(response ? response : null);
        });
    }

    var Option = {
        get: get, getAll: getAll, set: set
    }

    var opts = [{'key': 'select', 'def': 'true'}, 
                {'key': 'hover', 'def': 'false'}, 
                {'key': 'ctrl', 'def': 'false'}, 
                {'key': 'sentences', 'def': 'true'}],
                eleOpts = [];

    for(index in opts) {
        var key = opts[index].key, id = 'opt_' + key;
        var ele = document.getElementById(id);

        if (ele) {
            ~function() {
                var k = key, el = ele, def = opts[index].def;

                Option.get(k, def, function(value) {
                    el.checked = (value == 'true') ? true : false;
                });

                el.addEventListener('click', function(e) {
                    var value = el.checked ? 'true' : 'false';
                    Option.set(k, value, function() {
                        console.info('[Option] Set option '+ k +' as '+ value +'.');
                    });

                    try {
                        switch(k) {
                        case 'select':
                            markAnalyticsData(['_trackEvent', 'options_page', 'click', 'select_word']);
                            break;

                        case 'hover':
                            markAnalyticsData(['_trackEvent', 'options_page', 'click', 'hover_word']);
                            break;

                        case 'sentences':
                            markAnalyticsData(['_trackEvent', 'options_page', 'click', 'show_sentenses']);
                            break;
                        }
                    } catch(e) {}
                });
            }();

            eleOpts.push(ele);
        }
    }

    // Clear the cache
    var btnClearCache = document.getElementById("J_clearCache");
    if (btnClearCache) {
        btnClearCache.addEventListener("click", function() {
                sendMessage({storage: true, method: "clear"}, function(response) {
                    console.log("All caches is cleared.");
                });
                try {
                    markAnalyticsData(['_trackEvent', 'options_page', 'click', 'clear_cache']);
                } catch(e) {}
            });
    }

    // ga
    try {
        markAnalyticsData(['_trackEvent', 'popup_page', 'click', 'advance_config']);
        getScript(URL_GA_SCRIPT, function() {
            console.log("Analytics data has sended.");
        });
    } catch(e) {};
    
    cscope.Option = Option;
}(window);
