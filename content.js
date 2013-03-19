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

   var popup = document.createElement('div');
        popup.className = "pubmed-popup";
        popup.innerHTML = '<div class="popup-title">'+ getMessage("extName")
                            + '<a class="close" title="关闭">Close</a>'
                            + '</div> <div class="pubmed-content"></div>';
        document.body.appendChild(popup);

    if (!isSogouExplorer) {
        loadCSS(chrome.extension.getURL("popup.css"));
    }

    // --

    var popupHandler = new Popup(popup, {
        onShow: function(e) {
            if (this.popupContent) {
                this.popupContent.innerHTML = getMessage("waiting");
            }

            // Update the Options at showtime!
            fetcherHandle.updateOptions();
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
            var html = fetcherHandle.getResponseHTML(response);
            popupHandler.popupContent.innerHTML = (html.length > 0) ? html : getMessage("notfound");
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
    }

    update();
    window.addEventListener("focus", update, false);
    window.addEventListener("blue",  update, false);
} ();

