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
    loadCSS(sogouExplorer.extension.getURL("popup.css"));

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
            var values = [
                { "key": KEY_ISPINED,    "value": "true" },
                { "key": KEY_PINED_LEFT, "value": left   },
                { "key": KEY_PINED_TOP,  "value": top}
            ];

            for (var i = 0, len = values.length; i < len; i++) {
                var item = values[i];
                Option.set(item.key, item.value, function(v) { });
            }

            /*
            try {
                markAnalyticsData(['_trackEvent', 'popup', 'lock', 'lock']);
            } catch(error) { }
            */
        },

        onUnPin: function(e) {
            Option.set(KEY_ISPINED, "false", function(v) { });

            /*
                try {
                    markAnalyticsData(['_trackEvent', 'popup', 'unlock', 'unlock']);
                } catch(error) { }
            */
        },

        onShow: function(e) {
            if (this.popupContent) {
                this.popupContent.innerHTML = getMessage("waiting");
            }

            // Update the Options at showtime!
            fetcherHandle.updateOptions();

            try {
                var type = (e.type == 'mouseup') ? 'select' : 'hover';
                markAnalyticsData(['_trackEvent', 'popup', 'display', type]);
            } catch(error) { }
        },

        onClickMore: function() {
            try {
                markAnalyticsData(['_trackEvent', 'popup', 'redirect', 'redirect']);
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
        onFinished: (function() {
            var timer;
            return function(response) {
                var html = "";
                if (response.error) {
                    html = response.type;
                } else {
                    html = fetcherHandle.getResponseHTML(response.data);
                }

                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    $(popupHandler.popupContent).html(
                        html.length ? html: getMessage("notfound"));
                    popupHandler.decidePopupOffset();
                }, 0);
            };
        })(),

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
        Option.get(KEY_ISPINED, "true", function(v) {
            if (v == "true") {
                Option.get(KEY_PINED_TOP, 0, function(v) {
                    pinTop = v || 0;

                    Option.get(KEY_PINED_LEFT, 0, function(v) {
                        pinLeft = v || 0;

                        console.info("The value of Pin left,top is " + pinLeft + "," + pinTop);
                        popupHandler.markAsPin(pinLeft, pinTop);
                    });
                });
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
