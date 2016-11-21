// ==UserScript==
// @name         nCore Sort torrents by iMDB rating
// @namespace    https://github.com/elekdavid/tampermonkey-scripts
// @source       https://github.com/elekdavid/tampermonkey-scripts/raw/master/ncore_imdb_sort.user.js
// @version      0.1
// @description  Adding an option to sort the torrents on nCore by iMDB rating. Only works on one page, recommended to put the page size to 100 in the nCore settings.
// @author       David Elek
// @match        ncore.cc/torrents.php*
// @grant        GM_getValue
// @grant        GM_setValue
// @require http://code.jquery.com/jquery-latest.js
// @require https://cdnjs.cloudflare.com/ajax/libs/tinysort/2.3.6/tinysort.js
// @require https://cdnjs.cloudflare.com/ajax/libs/tinysort/2.3.6/jquery.tinysort.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Key name of the stored choosed option
    const storageKey = "isImdbSortEnabled";

    // Checkbox html
    const checkboxHtml =
          "<div style='display: block; text-align: center'>" +
          "  <input type='checkbox' id='imdb_sort_checkbox'>" +
          "  <label for='imdb_sort_checkbox'> Enable IMDB sort</label>" +
          "</div>" +
          "<div class='hr_stuff' deluminate_imagetype='gif'></div>";

    // Setting data attributes
    function setSortingAttributes() {
        var notImdb = 0.999;
        var originalOrder = 0;

        $(".box_torrent_all").children(".box_torrent").each(function(){
            var p = $(this);

            var sort_id;
            var id = p.html().match(/konyvjelzo\(\'\d+\'\)/g)[0].match(/\d+/g)[0];

            try {
                var imdb = p.html().match(/imdb: \d.\d/g)[0].match(/\d.\d/g)[0];
                sort_id = imdb + "_" + id;
            } catch (e) {
                sort_id = notImdb.toFixed(2) + "_" + id;
                notImdb -= 0.001;
            }

            p.prev().attr("data-imdb", sort_id + "_3");
            p.attr("data-imdb", sort_id + "_2");
            p.next().attr("data-imdb", sort_id + "_1");
            p.next().next().attr("data-imdb", sort_id + "_0");
        });

        // Put data-original-order attributes
        $(".box_torrent_all").children().each(function() {
            var p = $(this);
            p.attr("data-original-order", originalOrder++);
        });
    }

    // Add checkbox for activation
    function addSortingCheckbox() {
        $("#torrents1 > div.fobox_tartalom").prepend(checkboxHtml);
        var checkbox = $("#imdb_sort_checkbox");
        if (GM_getValue(storageKey) === "true") {
            checkbox.attr("checked", true);
            $(".box_torrent_all>div").tsort({attr:"data-imdb", order:"desc"});
        }
        checkbox.change(function(){
            if(this.checked) {
                GM_setValue(storageKey, "true");
                $(".box_torrent_all>div").tsort({attr:"data-imdb", order:"desc"});
            } else {
                GM_setValue(storageKey, "false");
                $(".box_torrent_all>div").tsort({attr:"data-original-order"});
            }
        });
    }

    setSortingAttributes();
    addSortingCheckbox();

})();