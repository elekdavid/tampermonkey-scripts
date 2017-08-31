// ==UserScript==
// @name         Redmine Updated at to Time Ago
// @namespace    https://github.com/elekdavid/tampermonkey-scripts
// @version      0.1
// @description  Rewrites redmine updated at field to time ago values.
// @author       David Elek
// @include      http*://redmine*issues*
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// @require https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
// ==/UserScript==

(function() {
  'use strict';

  $('td.updated_on').each(function() {
    var ago = moment($(this).text()).fromNow();
    $(this).text(ago);
  });
})();