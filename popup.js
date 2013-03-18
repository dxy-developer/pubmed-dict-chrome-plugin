// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<lucky#gracecode.com>
 * @date   2013-03-18
 */

(function(cscope) {
    var Popup = function(popup, config) {
        var defConfig = {
            clsClose: '.close',
            clsContent: '.pubmed-content',
            position: 'right',
            autoFit: true,
            enableMouseover: true,
            enableSelect: true,
            delay: 1000, // ms
            onFetchWord: function() {},
            onShow: null,
            onHide: null,
            onMove: null
        }; 
        var handle = {
            popup: popup,
            decidePopupOffset: decidePopupOffset,
            decidePopupPostioin: decidePopupPostioin
        }, body = document.body;

        // Regexp for test words
        var rHasWord = /\b[a-z]+([-'][a-z]+)*\b/i, 
            rAllWord = /\b[a-z]+([-'][a-z]+)*\b/gmi, 
            rSingleWord = /^[a-z]+([-'][a-z]+)*$/i;

        if (!_.isElement(popup)) {
            return;
        }

        config = _.extend(defConfig, config);

        /**
         *
         */
        function call(fn, obj) {
            var arg = _.rest(arguments, 2);
            return function () {
                return fn.apply(obj, arg);
            }
        }


        /**
         *
         */
        function stopEvent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            e.preventDefault();
        }


        /**
         *
         */
        function trim(s) {
            return s.replace(/(^\s*)|(\s*$)/g, ""); 
        }


        var inElement = function(needle, stack) {
            var parentNode = needle.parentNode;
            while(parentNode != null) {
                if (parentNode == stack) {
                    return true;
                }
                parentNode = parentNode.parentNode;
            }
            return false;
        }

        /**
         *
         */
        var decidePopupPostioin = function(e) {
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


        /**
         *
         */
        var decidePopupOffset = function() {
            var left = parseInt(popup.style.left), 
                top = parseInt(popup.style.top), 
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


        /**
         *
         */
        var mouseupTrigger = function(e){
            var nodeName = e.target.nodeName.toLowerCase();

            if (inElement(e.target, popup)) {
                return;
            }
 
            if (nodeName == 'input' || nodeName == 'textarea' || nodeName == 'select') {
                return;
            }
       
            var sText = (document.selection == undefined) ?  
                            document.getSelection().toString() : document.selection.createRange().text;

            if (trim(sText).length > 0 && rSingleWord.test(sText)) {
                if (config.onFetchWord) {
                    call(config.onFetchWord, handle, sText)();
                }
                handle.show(e);
            } else {
                handle.hide(e);
            }
        }


        /**
         *
         */
        var timer, hoverX, hoverY;
        var mouseoverTrigger = function(e) {
            var target = e.target, nodeName = e.target.nodeName.toLowerCase();

            if (inElement(target, popup)) {
                return;
            }

            if (nodeName == 'input' || nodeName == 'textarea' || nodeName == 'select') {
                return;
            }

            if (!timer) {
                return invadeNodes(e);
            }

            hoverX = e.pageX;
            hoverY = e.pageY;

            timer = setTimeout(call(function() {
                if (hoverY == e.pageY && hoverX == e.pageX) {
                    invadeNodes(e);
                }
            }, handler), config.delay);

            stopEvent(e);
        };


        var hoverTimer;
        var invadeNodes = function(e) {
            var parent = e.target, elems, wraper, i, len, elem, next;
            elems = parent.childNodes;
            if (elems.length === 1) {
                elem = elems[0];
                if (elem.nodeType === 3) {
                    var text = elem.nodeValue;
                    if (rSingleWord.test(text) && parent.resolve) {
                        text = elem.nodeValue;
                        if (hoverTimer) {
                            clearTimeout(hoverTimer);
                        }
                        hoverTimer = setTimeout(call(function() {
                            if (config.onFetchWord) {
                                call(config.onFetchWord, handle, text)();
                            }
                            handle.show(e);
                        }, handle), config.delay);
                    }
                    else if (rHasWord.test(text)) {
                        text = text.replace(rAllWord, function (str) {
                            return '<z>' + str + '</z>';
                        });
                        parent.innerHTML = text;
                        elems = parent.getElementsByTagName('z');
                        for (i = 0, len = elems.length ; i < len ; i += 1) {
                            elems[i].resolve = true;
                        }
                    }
                }
            }
            else if (!parent.resolve) {
                elems = Array.prototype.slice.call(elems, 0);
                this.timer = null;
                for (i = 0, len = elems.length ; i < len ; i += 1) {
                    elem = elems[i];
                    if (elem.nodeType === 3 && rHasWord.test(elem.nodeValue)) {
                        wraper = document.createElement('z');
                        parent.insertBefore(wraper, elem);
                        wraper.appendChild(elem);
                    }
                }
            }
            parent.resolve = true;
        };


        handle = _.extend(handle, {
            config: config,
            popupContent: popup.querySelector(config.clsContent),
            setEnableSelect: function(flag) {
                config.enableSelect = !!flag;
            },
            setEnableMouseover: function(flag) {
                config.enableMouseover = !!flag;
            },
            show: function(e) {
                if (config.onShow) {
                    call(config.onShow, handle, e)();
                }
                decidePopupPostioin(e);
                popup.style.display = 'block';
            },

            hide: function(e) {
                if (config.onHide) {
                    call(config.onHide, handle, e)();
                }
                popup.style.display = 'none';
            }
        });

        // Close Button
        var popupCloser = popup.querySelector(config.clsClose);
        popupCloser.addEventListener("click", function() {
            handle.hide();
        });

        body.addEventListener("mouseup", mouseupTrigger, false);
        body.addEventListener("mouseover", mouseoverTrigger, false);

        window.addEventListener("scroll", function(e) {
            handle.hide();
        }, false);


        popup.style.display = 'none';
        return handle;
    }

    cscope.Popup = Popup;
})(this);

