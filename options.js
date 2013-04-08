~function(cscope) {
    var isSogouExplorer = false;
    if (typeof sogouExplorer != 'undefined') {
        isSogouExplorer = true;
    }

    var get = (function() {

        return function(key, defVal, callback) {
            if (isSogouExplorer) {
                var value = localStorage.getItem(key);
                if (!value) {
                    value = defVal;
                }
                return callback && callback(value);
            }

            chrome.storage.sync.get(key, function(data) {
                var value = (data[key]) ? data[key] : defVal;
                callback(value);
            });
        }
    })();

    var getAll = function(callback) {
        if (isSogouExplorer) return null;
        chrome.storage.sync.get(callback);
    }

    var set = function(key, value, callback) {
        if (isSogouExplorer) {
            localStorage.setItem(key, value);
            if (callback) {
                callback(value);
            }

        } else {
            var data = {};
            data[key] = value;
            chrome.storage.sync.set(data, callback ? callback : function(){});
        }
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
                            _gaq.push(['_trackEvent', 'options_page', 'click', 'select_word']);
                            break;

                        case 'hover':
                            _gaq.push(['_trackEvent', 'options_page', 'click', 'hover_word']);
                            break;

                        case 'sentences':
                            _gaq.push(['_trackEvent', 'options_page', 'click', 'show_sentenses']);
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
            var backgroundPage = chrome.extension.getBackgroundPage();
            if (backgroundPage) {
                backgroundPage.Cacher.clear();
                try {
                    _gaq.push(['_trackEvent', 'options_page', 'click', 'clear_cache']);
                } catch(e) {}
            }
        });
    }

    // ga
    try {
        _gaq.push(['_trackEvent', 'popup_page', 'click', 'advance_config']);
        getScript(URL_GA_SCRIPT, function() {
            console.log("Analytics data has sended.");
        });
    } catch(e) {};
    
    cscope.Option = Option;
}(window);
