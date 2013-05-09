// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-02-21
 * @link   http://www.gracecode.com/
 */

Zepto(function($){
    function isIframe() {
        return (top === self) ? false : true;
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
    loadCSS(chrome.extension.getURL("popup.css"));

    var popup = document.createElement('div');
        popup.className = "pubmed-popup";
        popup.innerHTML = '<div class="popup-title">'+ getMessage("extName")
                            + '<span class="message"></span>'
                            + '<a class="pin" title="固定和取消固定窗口">Pin</a>'
                            + '<a class="close" title="关闭">Close</a>'
                            + '</div> <div class="pubmed-content"></div>';
        document.body.appendChild(popup);


    // --

    var KEY_ISPINED = "isPined", KEY_PINED_LEFT = "pinLeft", KEY_PINED_TOP = "pinTOP",
        pinLeft = localStorage.getItem(KEY_PINED_LEFT) || 0, pinTop = localStorage.getItem(KEY_PINED_TOP) || 0;

    var popupHandler = new Popup(popup, {
        pinedMsg: '已固定窗口',
        unPinedMsg: '取消固定',
        onPin: function(e, left, top) {
            chrome.storage.sync.set({
                KEY_ISPINED: "true", 
                KEY_PINED_LEFT: left,
                KEY_PINED_TOP: top
            }, function(){
                console.info("Mark pin status as true.");
                console.info("Mark pin left,top status " + left + "," + top);
            });
        },

        onUnPin: function(e) {
            chrome.storage.local.set({
                KEY_ISPINED: "false"
            }, function() {
                console.info("Mark pin status as false");
            });
        },

        onShow: function(e) {
            if (this.popupContent) {
                this.popupContent.innerHTML = getMessage("waiting");
            }

            // Update the Options at showtime!
            fetcherHandle.updateOptions();

            try {
                var type = (e.type == 'mouseup') ? 'select' : 'hover';
                _gaq = self._gaq || _gaq;
                _gaq.push(['_trackEvent', 'popup', 'display', type]);
            } catch(error) { }
        },

        onClickMore: function() {
            try {
                _gaq = self._gaq || _gaq;
                _gaq.push(['_trackEvent', 'popup', 'redirect', 'redirect']);
            } catch(error) { }
        },

        onHide: function(e) {
            if (this.popupContent) {
                this.popupContent.innerHTML = "";
            }
        },

        onFetchWord: function(word) {
            fetcherHandle.fetchWord(word);
        }
    });


    var fetcherHandle = new Fetcher({
        onFinished: function(response) {
            var html = Zepto.trim(fetcherHandle.getResponseHTML(response));
            console.info("getResponseHTML: " + html);
            //popupHandler.popupContent.innerHTML = (html.length > 0) ? html : getMessage("notfound");
            $(popupHandler.popupContent).html(html.length ? html: getMessage("notfound"));
            popupHandler.decidePopupOffset();
        },

        onOptionsUpdated: function(config) {
            if (config['select'] == 'false') {
                console.log('Select fetch word is disabled.');
                popupHandler.disableSelectEvent = true;
            } else {
                popupHandler.disableSelectEvent = false;
            }

            if (config['hover'] == 'false') {
                console.log('Hover fetch word is disabled.');
                popupHandler.disableMouseoverEvent = true;
            } else {
                popupHandler.disableMouseoverEvent = false;
            }
        }, 

        onError: function(error) {
            console.error("Error, Server response '" + getMessage(error) + "'.");
        }
    });

    var update = function() {
        fetcherHandle.updateOptions();
        popupHandler.hide();

        chrome.storage.sync.get({KEY_ISPINED: "true", KEY_PINED_TOP: 0, KEY_PINED_LEFT: 0}, function(result) {
            if (result.KEY_ISPINED == "true") {
                pinLeft = result.KEY_PINED_LEFT || 0;
                pinTop  = result.KEY_PINED_TOP  || 0;

                popupHandler.markAsPin(pinLeft, pinTop);
                console.info("The value of Pin left,top is " + pinLeft + "," + pinTop);
            } else {
                popupHandler.markAsUnPin();
                console.info("Mark as UnPin.");
            }
        });
    };

    update();
    window.addEventListener("focus", update, false);
    window.addEventListener("blue",  update, false);
});
