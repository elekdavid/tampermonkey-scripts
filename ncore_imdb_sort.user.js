// ==UserScript==
// @name         nCore Sort torrents by iMDB rating
// @namespace    https://github.com/elekdavid/tampermonkey-scripts
// @source       https://github.com/elekdavid/tampermonkey-scripts/raw/master/ncore_imdb_sort.user.js
// @version      0.2
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
    const imdbSortStorageKey = "isImdbSortEnabled";
    const imdbColorStorageKey = "isImdbColorEnabled";

    // Checkbox html
    const checkboxHtml =
          "<div style='display: block; text-align: center'>" +
          "  <input type='checkbox' id='imdb_sort_checkbox'>" +
          "  <label for='imdb_sort_checkbox'> Enable IMDB sort</label>" +
          "  <input type='checkbox' id='imdb_color_checkbox'>" +
          "  <label for='imdb_color_checkbox'> Color by IMDB</label>" +
          "</div>" +
          "<div class='hr_stuff' deluminate_imagetype='gif'></div>";

    const imdbColors = [
        {
            "minPoint": "9",
            "color": "#004D40"
        },
        {
            "minPoint": "8.5",
            "color": "#005648"
        },
        {
            "minPoint": "8.25",
            "color": "#006352"
        },
        {
            "minPoint": "8",
            "color": "#006d5b"
        },
        {
            "minPoint": "7.75",
            "color": "#007a65"
        },
        {
            "minPoint": "7.5",
            "color": "#007a65"
        },
        {
            "minPoint": "7",
            "color": "#00967c"
        },
        {
            "minPoint": "6.5",
            "color": "#0a9b82"
        },
        {
            "minPoint": "6",
            "color": "#15a88f"
        },
        {
            "minPoint": "-1",
            "color": "#616161"
		}
    ];

    // Function for getting background color for rating
    function getColorForRating(rating) {
        var result = null;
        $.each( imdbColors, function( i, imdbColor ) {
            if (result === null && rating > imdbColor.minPoint){
                result = imdbColor.color;
            }
        });

        return result;
    }

    // Setting data attributes
    function setSortingAttributes() {
        var notImdb = 0.999;
        var originalOrder = 0;

        $(".box_torrent_all").children(".box_torrent").each(function(){
            var p = $(this);

            var sort_id;
            var id = p.html().match(/konyvjelzo\(\'\d+\'\)/g)[0].match(/\d+/g)[0];
            var imdbColor = "#616161";

            try {
                var imdb = p.html().match(/imdb: \d.\d/g)[0].match(/\d.\d/g)[0];
                imdbColor = getColorForRating(imdb);
                //p.children(".box_nagy, .box_nagy2").css("background-color", getColorForRating(imdb));
                sort_id = imdb + "_" + id;
            } catch (e) {
                sort_id = notImdb.toFixed(2) + "_" + id;
                notImdb -= 0.001;
            }

            p.prev().attr("data-imdb-sort", sort_id + "_3");
            p.attr("data-imdb-sort", sort_id + "_2");
            p.next().attr("data-imdb-sort", sort_id + "_1");
            p.next().next().attr("data-imdb-sort", sort_id + "_0");

            p.children(".box_nagy, .box_nagy2").attr("data-imdb-color", imdbColor);
        });

        // Put data-original-order attributes
        $(".box_torrent_all").children().each(function() {
            var p = $(this);
            p.attr("data-original-order", originalOrder++);
        });

        // Put data-original-color attributes
        $(".box_nagy, .box_nagy2").each(function() {
            var p = $(this);
            p.attr("data-original-color", p.css("background-color"));
        });
    }

    // Add checkbox for activation
    function addCheckboxes() {
        $("#torrents1 > div.fobox_tartalom").prepend(checkboxHtml);
        var sortCheckbox = $("#imdb_sort_checkbox");
        var colorCheckbox = $("#imdb_color_checkbox");
        sortCheckbox.change(function(){
            if(this.checked) {
                GM_setValue(imdbSortStorageKey, "true");
                $(".box_torrent_all>div").tsort({attr:"data-imdb-sort", order:"desc"});
            } else {
                GM_setValue(imdbSortStorageKey, "false");
                $(".box_torrent_all>div").tsort({attr:"data-original-order"});
            }
        });
        colorCheckbox.change(function(){
            if (this.checked){
                $(".box_nagy, .box_nagy2").each(function() {
                GM_setValue(imdbColorStorageKey, "true");
                    $(this).css("background-color", $(this).attr("data-imdb-color"));
                });
            } else {
                GM_setValue(imdbColorStorageKey, "false");
                $(".box_nagy, .box_nagy2").each(function() {
                     $(this).css("background-color", $(this).attr("data-original-color"));
                });
            }
        });

        if (GM_getValue(imdbSortStorageKey) === "true") {
            sortCheckbox.attr("checked", true);
            sortCheckbox.trigger("change");
        }
        if (GM_getValue(imdbColorStorageKey) === "true") {
            colorCheckbox.attr("checked", true);
            colorCheckbox.trigger("change");
        }
    }

    setSortingAttributes();
    addCheckboxes();

})();
