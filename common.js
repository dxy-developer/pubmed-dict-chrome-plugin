// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-03-19
 */

~function(cscope) {
    var isSogouExplorer = false;
    if (typeof sogouExplorer != 'undefined') {
        isSogouExplorer = true;
    }


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
                if (typeof messages[id] != 'undefined') {
                    return messages[id];
                }

                return messages['default'];

            } else {
                return chrome.i18n.getMessage(id);
            }
        }
    })();

    cscope.getMessage = getMessage;

} (window);
