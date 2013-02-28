// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-02-21
 * @link   http://www.gracecode.com/
 */

~function() {
    var MIN_WORD_LENGTH = 2, MAX_WORD_LENGTH = 32;

    var body = document.body,
        popup = document.getElementById('J_PubMed_Popup'),
        popupClose = document.getElementById('J_PubMed_PopupClose'), 
        searchForm = document.getElementById('J_Form'),
        searchContent = document.getElementById('J_Content'),
        searchWord = document.getElementById('J_Word');

        var formatter = '<h4>{word} <span>({phonetic})</span></h4> <dl> <dd>{definition}</dd> <dt>例句</dt> <dd>{sentences}</dd> <dl>'+
            ' <a href="http://dict.pubmed.cn/{word}.htm" class="more">详细…</a>';

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
        var pregMatchWord = new RegExp('^[a-z]{' + MIN_WORD_LENGTH + ',' + MAX_WORD_LENGTH +'}$');
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

        if (data.sentences) {
            var tmp = [], index;
            for (index in data.sentences) {
                tmp.push(data.sentences[index].cn + "<br />" + data.sentences[index].en);
            }
            sentences = tmp.join("<br />");
        }

        if (data.definition) {
            var tmp = [], index;
            for (index in data.definition) {
                var def = data.definition[index];
                for (var i in def) {
                    tmp.push("<b>" + i + "</b><br />" + def[i]);
                }
            }
            definition = tmp.join("<br />");
        }

        return {
            word: data.en_word,
            phonetic: '英['+ data.phonetic.BrE +'] 美['+ data.phonetic.NAmE +']',
            sentences: sentences,
            definition: definition
        }
    }

    function showResponse(response) {
        var result = chrome.i18n.getMessage("notfound");
        if (response && response.data) {
            result = formatMessage(formatter, getValidObject(response.data))
        }

        searchContent.innerHTML = result;
    }

    // inform query
    var lastRequestWord;
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            var word = searchWord.value;
            if (isValidWord(word)) {
                searchContent.innerHTML = chrome.i18n.getMessage("waiting");
                searchContent.style.display = 'block';

                if (lastRequestWord != word) {
                    chrome.runtime.getBackgroundPage(function(backgroundPage) {
                        backgroundPage.fetchTranslate(word, showResponse);
                    });
                    lastRequestWord = word;
                }
            } else {
                searchWord.value = "";
                //alert(chrome.i18n.getMessage("plsInputVaildWord"));
            }
            stopEvent(e);
        });
    } else {
        popup = document.createElement('div');
        popup.className = "pubmed-popup";
        popup.innerHTML = '<div class="popup-title">'+ chrome.i18n.getMessage("extName") 
                                            +'</div> <div class="content" id="J_Content"></div>';
        body.appendChild(popup);
        loadCSS(chrome.extension.getURL("popup.css"));

        popupClose = document.getElementById('J_PubMed_PopupClose');
        searchContent = document.getElementById('J_Content');

        window.addEventListener("scroll", function(e) {
            if (popup.style.display != 'none') {
                popup.style.display = 'none';
            }
        });

        var port = chrome.extension.connect({name: "wordRequester"});
        port.onMessage.addListener(function(msg) {
            showResponse(msg);
            setTimeout(decidePopupOffset, 200);
        });
        body.addEventListener("mouseup", function(e) {
            var nodeName = e.target.nodeName.toLowerCase();
            if (nodeName == 'input' || nodeName == 'textarea' || nodeName == 'select') {
                return;
            }

           var sText = trim((document.selection == undefined) ? 
                document.getSelection().toString() : document.selection.createRange().text);


            if (isValidWord(sText)) {
                requestIsRunning = true;
                popup.style.display = 'block';
                decidePopupPostioin(e);
                if (lastRequestWord != sText) {
                    port.postMessage({words: sText});
                    lastRequestWord = sText;
                }
            } else {
                popup.style.display = 'none';
            }

        }, false);

        popup.addEventListener("mouseup", function(e) {
            stopEvent(e);
            return false;
        });
    }
}();
