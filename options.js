~function(cscope) {
    var get = (function() {
        return function(key, defVal, callback) {
            chrome.storage.sync.get(key, function(data) {
                var value = (data[key]) ? data[key] : defVal;
                callback(value);
            });
        };
    })();

    var getAll = function(callback) {
        chrome.storage.sync.get(callback);
    }

    var set = function(key, value, callback) {
        var data = {};
            data[key] = value;
        chrome.storage.sync.set(data, callback ? callback : function(){});
    }

    var Option = {
        get: get, getAll: getAll, set: set
    }

    var opts = [{'key': 'disabled', 'def': 'true'}, {'key': 'ctrl', 'def': 'false'}], eleOpts = [];
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
            }
        });
    }

    cscope.Option = Option;
}(window);
