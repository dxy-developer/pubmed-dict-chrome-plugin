// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-02-21
 * @link   http://www.gracecode.com/
 */

~function() {
    var MIN_WORD_LENGTH = 2, MAX_WORD_LENGTH = 32;
    var body = document.getElementsByTagName("body")[0],
        popup = document.getElementById('J_PubMed_Popup'),
        popupClose = document.getElementById('J_PubMed_PopupClose');

    function trim(s) {
        return s.replace(/(^\s*)|(\s*$)/g, ""); 
    }

    function decidePopupPostioin(e) {
        var left = 0, top = 0, popupWidth = popup.clientWidth;

        if (e.pageX || e.pageY) {
            left = e.pageX - document.body.scrollLeft;
            top = e.pageY - document.body.scrollTop;
        } else {
            left = e.clientX + document.body.scrollLeft - document.body.clientLeft;
            top = e.clientY + document.body.scrollTop  - document.body.clientTop;
        }

        if (popupWidth + left > body.clientWidth) {
            left = body.clientWidth - popupWidth * 1.5 ;
        }

        popup.style.left = left + 'px';
        popup.style.top  = top + 'px';
    }

    window.addEventListener("scroll", function(e) {
        if (popup.style.display != 'none') {
            popup.style.display = 'none';
        }
    });

    body.addEventListener("mouseup", function(e) {
       var sText = trim((document.selection == undefined) ? 
            document.getSelection().toString() : document.selection.createRange().text);

        var pregMatchWord = new RegExp('^\\w{' + MIN_WORD_LENGTH + ',' + MAX_WORD_LENGTH +'}$');

        if (pregMatchWord.test(sText)) {
            decidePopupPostioin(e);
            popup.style.display = 'block';

            console.info(sText);
        } else {
            popup.style.display = 'none';
        }

        /*
        chrome.extension.sendMessage({ word: "hello" }, function(response) {
            console.log(response);
        });
        */
    }, false);
}();
