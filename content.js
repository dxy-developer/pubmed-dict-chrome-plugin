// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-02-21
 * @link   http://www.gracecode.com/
 */

~function() {
    var isSogouExplorer = false;
    if (typeof sogouExplorer != 'undefined') {
        isSogouExplorer = true;
    }

    var MIN_WORD_LENGTH = 2, MAX_WORD_LENGTH = 48;
    var OPT_ENABLE = 'disabled', OPT_CTRL = 'ctrl', OPT_ENABLE_SENTENCES = 'sentences',
        OPT_ENABLE_DEFVAL = 'true', OPT_CTRL_DEFVAL = 'false', OPT_SENTENCES_DEFVAL = 'true';

    var body = document.body,
        popup = document.getElementById('J_PubMed_Popup'),
        popupClose = document.getElementById('J_PubMed_PopupClose'), 
        searchForm = document.getElementById('J_Form'),
        searchContent = document.getElementById('J_Content'),
        searchWord = document.getElementById('J_Word');

    var formatter = '<h4>{word} <span>{phonetic}</span></h4> <dl> <dd>{definition}</dd> {sentences} <dl>'+
            ' <a href="http://dict.pubmed.cn/{word}.htm" class="more" target="blank">详细…</a>';

    var getMessage = (function() {
        var messages = {
            "APIKEY_ERROR": "参数错误",
            "APIKEY_OR_KEYWORD_NULL": "参数错误",
            "ERROR_UNKNOWN": "未知错误",
            "NO_RESULTS": "抱歉，暂无结果",
            "OVER_LIMIT": "抱歉，超过请求限制",
            'extName': "医学英汉辞典",
            'notfound': "抱歉，没有找到",
            'waiting': "请稍等…",
            'default': ''
        };

        return function(id) {
            if (isSogouExplorer) {
                if (typeof messages[id] != 'undefined'){
                    return messages[id];
                }

                return messages['default'];

            } else {
                return chrome.i18n.getMessage(id);
            }
        }
    })();

    function isIframe() {
        if (top === self) {
            return false;
        } else {
            return true;
        }
    }

    function trim(s) {
        return s.replace(/(^\s*)|(\s*$)/g, ""); 
    }

    function loadCSS(url) {
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.media = 'all';
        head.appendChild(link);
    }

    function stopEvent(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();
    }

    function isValidWord(word) {
        var pregMatchWord = new RegExp('^[a-z|\ |\-]{' + MIN_WORD_LENGTH + ',' + MAX_WORD_LENGTH +'}$');
        return pregMatchWord.test(word);
    }

    function decidePopupPostioin(e) {
        var left = 0, top = 0, popupWidth = popup.clientWidth;

        if (e.pageX || e.pageY) {
            left = e.pageX - body.scrollLeft;
            top = e.pageY - body.scrollTop;
        } else {
            left = e.clientX + body.scrollLeft - body.clientLeft;
            top = e.clientY + body.scrollTop  - body.clientTop;
        }

        popup.style.left = left + 'px';
        popup.style.top  = top + 'px';
    }

    function decidePopupOffset() {
        var left = parseInt(popup.style.left), top = parseInt(popup.style.top), 
            popupWidth = popup.clientWidth,
            popupHeight = popup.clientHeight;

        if (popupWidth + left > window.innerWidth) {
            left = window.innerWidth - popupWidth * 1.2;
        }

        if (popupHeight + top > window.innerHeight) {
            top = window.innerHeight - popupHeight * 1.1;
        }

        popup.style.left = left + 'px';
        popup.style.top  = top + 'px';
    }

    // @see https://code.google.com/p/tbra/source/search?q=format&origq=format&btnG=Search+Trunk
    var formatMessage = function (msg, values, filter) {
        var pattern = /\{([\w-]+)?\}/g;
        return function(msg, values, filter) {
            return msg.replace(pattern, function(match, key) {
                return filter ? filter(values[key], key) : values[key];
        });
    }}();


    var getValidObject = function(data) {
        var definition = "", sentences = "";

        Option.get(OPT_ENABLE_SENTENCES, OPT_SENTENCES_DEFVAL, function(val) {
            OPT_SENTENCES_DEFVAL = val;
        });

        if (data.sentences && OPT_SENTENCES_DEFVAL != 'false') {
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
        
        var phonetic = 
            (data.phonetic.BrE ? '英['+ data.phonetic.BrE +'] ' : "") + 
            (data.phonetic.NAmE ? '美['+ data.phonetic.NAmE +'] ' : "");

        if (phonetic.length) {
            phonetic = '('+phonetic+')';
        }

        return {
            word: data.en_word,
            phonetic: phonetic,
            sentences: sentences ? '<dt>例句</dt> <dd>'+ sentences +'</dd>' : "",
            definition: definition
        }
    }

    // http://qa.linkmed.com.cn/confluence/pages/viewpage.action?pageId=35324223
    function showResponse(response) {
        var result = "";
        if (response && response.data) {
            if (response.data.ERROR) {
                result = getMessage(response.data.ERROR);
            } else {
                result = formatMessage(formatter, getValidObject(response.data))
            }
        } else {
            //result = getMessage("notfound");
        }

        searchContent.innerHTML = result;
    }

    // inform query
    var lastRequestWord, timer;

    if (searchForm) {
        if (isSogouExplorer) {
            Option = sogouExplorer.extension.getBackgroundPage().Option;
        }

        searchForm.addEventListener('submit', function(e) {
            var word = searchWord.value.toLowerCase();
            if (isValidWord(word)) {
                searchContent.innerHTML = getMessage("waiting");
                searchContent.style.display = 'block';

                if (true || lastRequestWord != word) {
                    if (isSogouExplorer) {
                        var backgroundPage = sogouExplorer.extension.getBackgroundPage();
                        backgroundPage.fetchTranslate(word, showResponse);
                    } else {
                        chrome.runtime.getBackgroundPage(function(backgroundPage) {
                            backgroundPage.fetchTranslate(word, showResponse);
                        });
                    }
                    lastRequestWord = word;
                }
            } else {
                searchWord.value = "";
            }
            stopEvent(e);
        });

        var configEl = document.getElementById("config");
        configEl.addEventListener("click", function(e) {
            if (isSogouExplorer) {
                var path = sogouExplorer.extension.getURL("options.html");
                sogouExplorer.tabs.create({url:path});
            } else {
                chrome.tabs.create({url: "options.html"});
            }
            stopEvent(e);
        });

        var disabledEl =  document.getElementById("opt_disable");
        Option.get(OPT_ENABLE, OPT_ENABLE_DEFVAL, function(val) {
            disabledEl.checked = (val == 'false') ?  false : true;
        });
        disabledEl.addEventListener('click', function(e) {
            var value = disabledEl.checked ? 'true' : 'false';
            Option.set(OPT_ENABLE, value, function(val) {
                console.info('[Option]' + OPT_ENABLE + " set value as " + val);
            });
        });

        setTimeout(function() {
            searchWord.focus();
        }, 500);
    } else {

        // fetch the default.
        Option.get(OPT_ENABLE_SENTENCES, OPT_SENTENCES_DEFVAL, function(val) {
            OPT_SENTENCES_DEFVAL = val;
        });
 
        popup = document.createElement('div');
        popup.className = "pubmed-popup";
        popup.innerHTML = '<div class="popup-title">'+ getMessage("extName")
                                            + '<a class="close" id="J_PubMed_PopupClose" title="关闭">Close</a>'
                                            + '</div> <div class="content" id="J_Content"></div>';
        body.appendChild(popup);
        if (!isSogouExplorer) {
            loadCSS(chrome.extension.getURL("popup.css"));
        }

        popupClose = document.getElementById('J_PubMed_PopupClose');
        searchContent = document.getElementById('J_Content');

        function hidePopup() {
            popup.style.display = 'none';
            searchContent.innerHTML = '';
        }

        window.addEventListener("scroll", function(e) {
            hidePopup();
        });

        popupClose.addEventListener("click", function(e){
            hidePopup();
            stopEvent(e);
        });

        var port = null;
        var onFinished = function(response) {
            //console.info(response);
            showResponse(response);
            setTimeout(decidePopupOffset, 50);
        }

        if (!isSogouExplorer) {
            port = chrome.extension.connect({name: "wordRequester"});
            port.onMessage.addListener(onFinished);
        }

        var handler = function(e) {
            // get default from options.html
            Option.get(OPT_CTRL, OPT_CTRL_DEFVAL, function(val) {
                OPT_CTRL_DEFVAL = val;
            });

            Option.get(OPT_ENABLE, OPT_ENABLE_DEFVAL, function(val) {
                OPT_ENABLE_DEFVAL = val;
            });

            if (OPT_ENABLE_DEFVAL == 'false') {
                return;
            }

            /*
            if (OPT_CTRL_DEFVAL == 'true' && !e.metaKey) {
                return;
            }
            */

            var nodeName = e.target.nodeName.toLowerCase();
            if (nodeName == 'input' || nodeName == 'textarea' || nodeName == 'select') {
                return;
            }

           var sText = trim((document.selection == undefined) ? 
                document.getSelection().toString() : document.selection.createRange().text).toLowerCase();

            if (isValidWord(sText)) {
                searchContent.innerHTML = getMessage('waiting');
                popup.style.display = 'block';
                decidePopupPostioin(e);

                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    if (true || lastRequestWord != sText) {
                        if (!isSogouExplorer) {
                            port.postMessage({words: sText});
                        } else {
                            sogouExplorer.extension.sendRequest({
                                command: "searchWords", words: sText
                            }, onFinished);
                        }
                        lastRequestWord = sText;
                    }
                }, 0);
            } else {
                popup.style.display = 'none';
            }
        };
        body.addEventListener("mouseup", handler, false);

        popup.addEventListener("mouseup", function(e) {
            stopEvent(e);
            return false;
        });
    }
}();
