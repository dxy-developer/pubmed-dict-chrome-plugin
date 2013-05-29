// vim: set et sw=4 ts=4 sts=4 ft=javascript fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2013-05-09
 * @link   http://www.gracecode.com/
 */

var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-38076372-14']);
    _gaq.push(['_trackPageview']);

//var URL_GA_SCRIPT = "https://ssl.google-analytics.com/ga.js?t=" + (+new Date()) +"&fuckgfw=always";

~function() {
     var ga = document.createElement('script');
         ga.type = 'text/javascript';
         ga.async = true;

         /*
         ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') 
                    + '.google-analytics.com/ga.js' + "?t=" + (+new Date()) +"&fuckgfw=always";
         */

         ga.src = "https://ssl.google-analytics.com/ga.js?t=" + (+new Date()) +"&fuckgfw=always";

     var s = document.getElementsByTagName('script')[0];
         s.parentNode.insertBefore(ga, s);

     var timer;
     function startWather() {
         if (timer) {
             clearInterval(timer);
         }

         timer = setInterval(function() {
             var gaStr = document.body.getAttribute("ga"), data;
             if (!ga.length) {
                return;
             }

             data = JSON.parse(gaStr);
             if (data) {
                console.info("Get ga data from elements, send it.");
                _gaq.push(data);
                document.body.setAttribute("ga", "");
             }
         }, 1000);
     };

     startWather();
     window.addEventListener("focus", startWather, false);
     window.addEventListener("blue",  function() {
         if (timer) {
             clearInterval(timer);
         }
     }, false);
}();
