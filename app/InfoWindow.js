define(function() {

    var instances = [];

    var infoBoxStyles = {
         disableAutoPan: false,
         pixelOffset: new google.maps.Size(-123, 0),
         boxStyle: {
            background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no-repeat",
            opacity: 1
        },
        closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
    };

    var pissedBoxStyles = {
        disableAutoPan: false,
        pixelOffset: new google.maps.Size(-123, 0),
        boxStyle: {
            background: "rgb(255, 255, 255)",
            opacity: 0.8
        },
        closeBoxURL: ""
    };

    return {
        getInstance: function(options, addToList) {

            if (typeof addToList === "undefined") {
                addToList = true;
            }

            var infoWindow = new InfoBox(infoBoxStyles);

            if (addToList) {
                instances.push(infoWindow);
            }
            return infoWindow;
        },

        openPissedInstance: function(map, marker, content, closedCallback, delay) {

            if (typeof delay === "undefined") {
                delay = 2000;
            }

            var infoWindow = new InfoBox(pissedBoxStyles);
            infoWindow.setContent('<h4 class="pissed-text">' + content + '</h4>');
            infoWindow.open(map, marker);

            // Close it in delay seconds.
            setTimeout(function() {
                closedCallback();
                infoWindow.close();
                infoWindow = null;
            }, delay);

            return infoWindow;
        },

        open: function(infoWindow, map, marker) {
            this.closeAll();
            infoWindow.open(map, marker);
        },

        closeAll: function() {
            for (var i in instances) {
                instances[i].close();
            }
            instances = [];
        }
    };
});
