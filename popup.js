// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<lucky#gracecode.com>
 * @date   2013-03-18
 */

Zepto(function($) {
    var Popup = function(popup, config) {
        var defConfig = {
            clsClose: 'close',
            clsPin: 'pin',
            clsPined: 'pined',
            clsMsg: 'message',
            pinedMsg: 'pined',
            unPinedMsg: 'unpined',
            clsContent: '.pubmed-content',
            enableMouseover: true,
            enableSelect: true,
            delay: 1000, // ms
            onFetchWord: null,
            onShow: null,
            onClickMore: null,
            onHide: null,
            onPin: null,
            onUnPin: null,
            onMove: null
        }; 
        var handle = {
            popup: popup,
            disableSelectEvent: false,
            disableMouseoverEvent: false,
            decidePopupOffset: decidePopupOffset,
            decidePopupPostioin: decidePopupPostioin
        }, body = document.body;

        var MAX_WORD_LENGTH = 64, 
            isPined = false, pinLeft = 0, pinTop = 0;

        // Regexp for test words
        var rHasWord = /\b[a-z]+([-'\ ][a-z]+)*\b/i, 
            rAllWord = /\b[a-z]+([-'][a-z]+)*\b/gmi, 
            rSingleWord = /^[a-z]+([-'][a-z]+)*$/i;

        if (!_.isElement(popup)) {
            return;
        }

        config = _.extend(defConfig, config);

        /**
         * 运行指定作用域的函数
         */
        function call(fn, obj) {
            var arg = _.rest(arguments, 2);
            return function () {
                return fn.apply(obj, arg);
            }
        }

        var stopEvent = function(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            e.preventDefault();
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
         * 根据事件判断位置
         */
        var decidePopupPostioin = function(e) {
            var left = 0, top = 0, popupWidth = popup.clientWidth;

            if (e.pageX || e.pageY) {
                left = e.pageX - body.scrollLeft;
                top  = e.pageY - body.scrollTop;
            } else {
                left = e.clientX + body.scrollLeft - body.clientLeft;
                top  = e.clientY + body.scrollTop  - body.clientTop;
            }

            if (isPined) {
                left = pinLeft; top = pinTop;
            }

            popup.style.left = left + 'px';
            popup.style.top  = top + 'px';
        }


        /**
         * 判断选择框出现的位置
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

            // ...
            popup.style.left = left + 'px';
            popup.style.top  = top + 'px';
        }


        /**
         * 选择取词
         */
        var mouseupTrigger = function(e){
            var nodeName = e.target.nodeName.toLowerCase();

            var target = e.target;
            //console.info(target);

            if (handle.disableSelectEvent) {
                return;
            }

            if (inElement(e.target, popup)) {
                return;
            }
 
            if (nodeName == 'input' || nodeName == 'textarea' || nodeName == 'select') {
                return;
            }
       
            var sText = (document.selection == undefined) ?  
                            document.getSelection().toString() : document.selection.createRange().text;
                sText = Zepto.trim(sText);

            if (sText.length > 0 && sText.length < MAX_WORD_LENGTH && rHasWord.test(sText)) {
                console.log("Selected word is " + sText + ".");
                if (config.onFetchWord) {
                    call(config.onFetchWord, handle, sText)();
                }
                handle.show(e);
            } else {
                handle.hide(e);
            }
        }


        /**
         * 鼠标悬浮事件
         */
        var timer, hoverX, hoverY;
        var mouseoverTrigger = function(e) {
            var target = e.target, nodeName = e.target.nodeName.toLowerCase();

            if (handle.disableMouseoverEvent) {
                return;
            }

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
            }, handle), config.delay);

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
            decidePopupOffset: decidePopupOffset,
            popupContent: popup.querySelector(config.clsContent),
            pinTrigger: pinTrigger,
            closeTirgger: popupCloser,
            setEnableSelect: function(flag) {
                config.enableSelect = !!flag;
            },
            markAsPin: function(left, top) {
                isPined = true;
                pinLeft = left;
                pinTop = top;
                pinTrigger.addClass(config.clsPined);
            },
            markAsUnPin: function() {
                isPined = false;
                pinTrigger.removeClass(config.clsPined);
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
                this.popupContent.innerHTML = "";
            }
        });

        // Close Button
        var popupCloser = $(popup).find("." + config.clsClose);
        popupCloser.bind("click", function(e) {
            if (isPined) {
                var position = Zepto(popup).position();
                pinLeft = position.left; pinTop  = position.top;
                call(config.onPin, handle, e, position.left, position.top)();
            }
            handle.hide(e);
            return false;
        });

        var pinTrigger = $(popup).find("." + config.clsPin), msgEl =  $(popup).find("." + config.clsMsg);
        pinTrigger.bind("click", function(e) {
            if ($(pinTrigger).hasClass(config.clsPined)) {
                call(config.onUnPin, handle, e)();
                $(pinTrigger).removeClass(config.clsPined);
                $(msgEl).html(config.unPinedMsg);
                $(msgEl).css({opacity: 1});
                $(msgEl).animate({ opacity: 0 }, 1000, 'ease-out');
                isPined = false;
            } else {
                var position = Zepto(popup).position();
                call(config.onPin, handle, e, position.left, position.top)();
                pinLeft = position.left; pinTop  = position.top;
                $(pinTrigger).addClass(config.clsPined);

                $(msgEl).html(config.pinedMsg);
                $(msgEl).css({opacity: 0});
                $(msgEl).animate({ opacity: 1 }, 800, 'ease-out');
                setTimeout(function() {
                    $(msgEl).animate({ opacity: 0 }, 500, 'ease-out');
                }, 2000)
                isPined = true;
            }
            return false;
        });


        // 设置可以拖动的
        var setDragable = function(bar, target) {
            var params = {
                left: 0, top: 0, currentX: 0, currentY: 0, flag: false
            };

            //获取相关CSS属性
            var getCss = function(o,key){
                return o.currentStyle? o.currentStyle[key] : document.defaultView.getComputedStyle(o,false)[key]; 	
            };

            //拖拽的实现
            var startDrag = function(bar, target){
                if(getCss(target, "left") !== "auto"){
                    params.left = getCss(target, "left");
                }

                if(getCss(target, "top") !== "auto"){
                    params.top = getCss(target, "top");
                }

                bar.addEventListener("mousedown", function(event) {
                    params.flag = true;
                    if(!event){
                        event = window.event;
                        //防止IE文字选中
                        bar.onselectstart = function(){
                            return false;
                        }  
                    }
                    var e = event;
                    params.currentX = e.clientX;
                    params.currentY = e.clientY;

                    // http://stackoverflow.com/questions/2212542/how-can-i-prevent-selecting-text-in-google-chrome
                    var style = document.body.style;
                        style.userSelect = "none"; 
                        style.webkitUserSelect = "none";

                    stopEvent(e);
                });

                document.addEventListener("mouseup", function(e) {
                    params.flag = false;	
                    if(getCss(target, "left") !== "auto"){
                        params.left = getCss(target, "left");
                    }
                    if(getCss(target, "top") !== "auto"){
                        params.top = getCss(target, "top");
                    }

                    if (isPined) {
                        pinLeft = params.left;
                        pinTop  = params.top;
                        call(config.onPin, handle, e, params.left, params.top)();
                    }

                    var style = document.body.style;
                        style.userSelect = "auto"; 
                        style.webkitUserSelect = "auto";

                    stopEvent(e);
                });

                document.addEventListener("mousemove", function(event) {
                    var e = event ? event: window.event;
                    if(params.flag){
                        var nowX = e.clientX, nowY = e.clientY;
                        var disX = nowX - params.currentX, disY = nowY - params.currentY;
                        target.style.left = parseInt(params.left) + disX + "px";
                        target.style.top = parseInt(params.top) + disY + "px";
                    }
                });	
            }

            startDrag(bar, target);
        };

        // 设置可以拖动的元素
        setDragable(popup.querySelector(".popup-title"), popup);

        body.addEventListener("mouseup", mouseupTrigger, false);
        body.addEventListener("mouseover", mouseoverTrigger, false);

        window.addEventListener("scroll", function(e) {
            if (!isPined) {
                handle.hide(e);
            }
        }, false);


        popup.style.display = 'none';
        return handle;
    }

    window.Popup = Popup;
});

