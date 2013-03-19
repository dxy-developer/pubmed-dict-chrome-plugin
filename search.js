// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-03-18
 */

~function() {
        var isSogouExplorer = false;
        if (typeof sogouExplorer != 'undefined') {
            isSogouExplorer = true;
        }

        if (isSogouExplorer) {
            Option = sogouExplorer.extension.getBackgroundPage().Option;
        }

        var searchForm    = document.getElementById('J_Form'),
            searchWord    = document.getElementById('J_Word'),
            searchContent = document.getElementById("J_Content"), 
            configEl      = document.getElementById("config"),
            rSingleWord   = /^[a-z]+([-'][a-z]+)*$/i;

        var isValidWord = function(word) {
            return rSingleWord.test(word);
        }

        var stopEvent = function(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            e.preventDefault();
        }


        var fetcherHandle = new Fetcher({
            onFinished: function(response) {
                var html = fetcherHandle.getResponseHTML(response);
                searchContent.innerHTML = (html.length > 0) ? html : getMessage("notfound");
            },

            onOptionsUpdated: function(config) {

            }, 

            onError: function(error) {
                console.error("Error, Server response '" + getMessage(error) + "'.");
                searchContent.innerHTML = getMessage(error);
            }
        });


        searchForm.addEventListener('submit', function(e) {
            var word = searchWord.value.toLowerCase();
            if (isValidWord(word)) {
                fetcherHandle.fetchWord(word);
            }
            stopEvent(e);
        });

        configEl.addEventListener("click", function(e) {
            if (isSogouExplorer) {
                var path = sogouExplorer.extension.getURL("options.html");
                sogouExplorer.tabs.create({url:path});
            }  else {
                chrome.tabs.create({url: "options.html"});
            }
            stopEvent(e);
        });


        var defOptions = {
            'select': 'true',
            'hover': 'true',
            'sentences': 'true',
            'ctrl': 'false'
        };

        // fetch the default.
        var updateOptions = function() {
            _.each(defOptions, function(value, key, list) {
                Option.get(key, value, function(v) {
                    defOptions[key] = v ? v : value;
                    var id  = 'opt_' + defOptions[key],
                        ele = document.getElementById(id),
                        k = key;

                    if (!ele) { return; }
                    ele.checked = (defOptions[key] == 'false') ?  false : true;
                    ~function() {
                        ele.addEventListener('click', function(e) {
                            var val = ele.checked ? 'true' : 'false';
                            Option.set(k, val, function(val) {
                                console.info('[Option]' + k + " set value as " + val);
                            });
                        });
                    }();
                });
            });
        };

        setTimeout(function() {
            searchWord.focus();
        }, 0);
}();
