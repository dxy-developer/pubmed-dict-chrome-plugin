// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-02-21
 * @link   http://www.gracecode.com/
 */

var body = document.getElementsByTagName("body")[0];

body.addEventListener("mouseup", function() {
    chrome.extension.sendMessage({ word: "hello" }, function(response) {
        console.log(response);
    });
}, false);
