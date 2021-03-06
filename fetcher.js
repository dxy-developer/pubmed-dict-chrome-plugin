// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-03-18
 */

(function(cscope) {
    var Fetcher = function(config) {
        var defConfig = {
            onOptionsUpdated: null, onFinished: null, onError: null
        }; 
        config = _.extend(defConfig, config);

        var handle = {};

        function call(fn, obj) {
            var arg = _.rest(arguments, 2);
            return function () {
                return fn.apply(obj, arg);
            }
        }

        var defOptions = {
            'select': 'true',
            'hover': 'false',
            'sentences': 'true',
            'ctrl': 'false'
        };

        // fetch the default.
        var updateOptions = function(callback) {
            _.each(defOptions, function(value, key, list) {
                Option.get(key, value, function(v) {
                    defOptions[key] = v ? v : value;
                    callback ? callback() : null;
                });
            });
        };
 
        var formatter = '<h4>{word} <span>{phonetic}</span></h4> <dl> <dd>{definition}</dd> {sentences} <dl>'+
            ' <a href="http://dict.pubmed.cn/{word}.htm" class="more" target="blank">详细…</a>';


        // @see https://code.google.com/p/tbra/source/search?q=format&origq=format&btnG=Search+Trunk
        var formatMessage = function (msg, values, filter) {
            var pattern = /\{([\w-]+)?\}/g;
            return function(msg, values, filter) {
                return msg.replace(pattern, function(match, key) {
                    return filter ? filter(values[key], key) : values[key];
            });
        }}();


        // http://qa.linkmed.com.cn/confluence/pages/viewpage.action?pageId=35324223
        var getResponseHTML = function(response) {
            var result = "";
            if (response.ERROR || (response.data && response.data.ERROR)) {
                if (config.onError) {
                    call(config.onError, handle, response.ERROR || response.data.ERROR)();
                }

            } else {
                var obj = getValidObject(response.data || response);
                console.info(obj);
                result = formatMessage(formatter, obj);
            }

            return result;
        };


        var getValidObject = function(data) {
            var definition = "", sentences = "";

            if (data.sentences && defOptions['sentences'] != 'false') {
                var tmp = [], index;
                for (index in data.sentences) {
                    tmp.push("<p>" + data.sentences[index].cn + "</p><p>" + data.sentences[index].en + "</p>");
                }
                sentences = tmp.join("<hr />");
            }

            if (data.definition) {
                var tmp = [], index;
                for (index in data.definition) {
                    var def = data.definition[index];
                    for (var i in def) {
                        tmp.push("<h5>" + i + "</h5><p>" + def[i] + "</p>");
                    }
                }
                definition = tmp.join("");
            }
            
            var phonetic = "";
            if (Zepto.isArray(data.phonetic)) {
               Zepto.each(data.phonetic, function(index, item) {
                    if (item.BrE) {
                      phonetic += '英['+ item.BrE +'] ';
                    }

                    if (item.NAmE) {
                        phonetic += '美['+ item.NAmE +'] ';
                    }
                });
            } else if (data.phonetic.length) {
                phonetic = '('+ Zepto.trim(data.phonetic) +')';
            }

            return {
                word: data.en_word,
                phonetic: phonetic,
                sentences: sentences ? '<dt>例句</dt> <dd>'+ sentences +'</dd>' : "",
                definition: definition
            }
        };

        var port = chrome.extension.connect({name: "wordRequester"});
        if (config.onFinished) {
            port.onMessage.addListener(config.onFinished);
        }

        handle = _.extend(handle, {
            getResponseHTML: getResponseHTML,
            fetchWord: function(word) {
                port.postMessage({words: word});
            },
            updateOptions: function() {
                var callback = function() {}
                if (config.onOptionsUpdated) {
                    callback = call(config.onOptionsUpdated, handle, defOptions);
                }
                updateOptions(callback);
            },
            config: config
        });

        return handle;
    };

    cscope.Fetcher = Fetcher;
})(window);
