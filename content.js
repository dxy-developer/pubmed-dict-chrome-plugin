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

    var formatter = '<h4>{word} <span>({phonetic})</span></h4> <dl> <dt>含义</dt> <dd>{definition}</dd> <dt>例句</dt> <dd>{sentences}</dd> <dl>';

    function trim(s) {
        return s.replace(/(^\s*)|(\s*$)/g, ""); 
    }

    function stopEvent(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();
    }

    function isValidWord(word) {
        var pregMatchWord = new RegExp('^\\w{' + MIN_WORD_LENGTH + ',' + MAX_WORD_LENGTH +'}$');
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

        console.info(popupWidth);
        console.info(left);
        console.info(body.clientWidth);

        if (popupWidth + left > body.clientWidth) {
            left = body.clientWidth - popupWidth * 1.5;
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
            sentences = tmp.join("<br /></br />");
        }

        if (data.definition) {
            var tmp = [], index;
            for (index in data.definition) {
                var def = data.definition[index];
                for (var i in def) {
                    tmp.push(i + ": " + def[i]);
                }
            }
            definition = tmp.join("<br />");
        }

        return {
            word: data.en_word,
            phonetic: '英['+ data.phonetic.BrE +'] 美['+ data.phonetic.NamE +']',
            sentences: sentences,
            definition: definition
        }
    }

    function showResponse(response) {
        var result = '抱歉，没有找到需要的结果';
        if (response && response.data) {
            result = formatMessage(formatter, getValidObject(response.data))
        }

        searchContent.innerHTML = result;
    }

    // inform query
    if (typeof searchForm != 'undefinded') {
        searchForm.addEventListener('submit', function(e) {
            var word = searchWord.value;
            if (isValidWord(word)) {
                searchContent.innerHTML = "请稍候";
                searchContent.style.display = 'block';
                chrome.runtime.getBackgroundPage(function(backgroundPage) {
                    backgroundPage.fetchTranslate(word, showResponse);
                });
            } else {
                searchWord.value = "";
                alert('请输入有效的英文单词');
            }
            stopEvent(e);
        });
    } else {
        
    }

    /*
    window.addEventListener("scroll", function(e) {
        if (popup.style.display != 'none') {
            popup.style.display = 'none';
        }
    });

    body.addEventListener("mouseup", function(e) {
       var sText = trim((document.selection == undefined) ? 
            document.getSelection().toString() : document.selection.createRange().text);

        if (isValidWord(sText)) {
            popup.style.display = 'block';
            decidePopupPostioin(e);

            console.info(sText);
        } else {
            popup.style.display = 'none';
        }

                //chrome.extension.sendMessage({command:'search', words: word }, showResponse);
        chrome.extension.sendMessage({ word: "hello" }, function(response) {
            console.log(response);
        });
    }, false);

    popup.addEventListener("mouseup", function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();
        return false;
    });
    */
}();
