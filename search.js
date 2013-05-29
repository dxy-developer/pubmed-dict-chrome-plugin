// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-03-18
 */

~function() {
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
            onFinished: (function() {
                var timer;
                return function(response) {
                    var html = fetcherHandle.getResponseHTML(response);
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(function() {
                        console.log("getResponseHTML: " + html);
                        if (html.length) {
                            $(searchContent).html(html);
                        }
                    }, 200);
                };
            })(),

            onOptionsUpdated: function(config) {

            }, 

            onError: function(error) {
                console.error("Error, Server response '" + getMessage(error) + "'.");
                searchContent.innerHTML = getMessage(error);
            }
        });


        searchForm.addEventListener('submit', function(e) {
            var word = searchWord.value.toLowerCase();
            if (true || isValidWord(word)) {
                fetcherHandle.fetchWord(word);
            }

            try {
                markAnalyticsData(['_trackEvent', 'popup_page', 'click', 'search']);
            } catch(e) {}

            stopEvent(e);
        });

        configEl.addEventListener("click", function(e) {
            var path = sogouExplorer.extension.getURL("options.html");
            sogouExplorer.tabs.create({url:path});

            try {
                markAnalyticsData(['_trackEvent', 'popup_page', 'click', 'advance_config']);
            } catch(e) {}
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

                            try {
                                switch(k) {
                                    case 'select':
                                        markAnalyticsData(['_trackEvent', 'popup_page', 'click', 'select_word']);
                                        break;

                                    case 'hover':
                                        markAnalyticsData(['_trackEvent', 'popup_page', 'click', 'hover_word']);
                                        break;
                                }
                            } catch(e) {}
                        });
                    }();
                });
            });
        };
} ();
