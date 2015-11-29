define(function() {

    var instances = [];

    return {

        initStyles: function() {

            this.bgImageStyles = {
                 disableAutoPan: false,
                 pixelOffset: new google.maps.Size(-123, 0),
                 boxStyle: {
                    background: "url('img/tipbox.gif') no-repeat",
                    opacity: 1
                },
                closeBoxURL: "img/close.png"
            };

            this.justTextStyles = {
                disableAutoPan: false,
                pixelOffset: new google.maps.Size(-123, 0),
                boxStyle: {
                    background: "rgb(255, 255, 255)",
                    opacity: 0.8
                },
                closeBoxURL: ""
            };

            this.stepStyles = {
            };

        },

        getInstance: function() {

            var infoWindow = new InfoBox(this.bgImageStyles);

            instances.push(infoWindow);

            return infoWindow;
        },

        openInfoInstance: function(options) {

            if (typeof options.delay === "undefined") {
                options.delay = 2000;
            }

            if (typeof options.closedCallback === "undefined") {
                options.closedCallback = function() {};
            }

            var infoWindow = new InfoBox(this.justTextStyles);
            infoWindow.setContent('<h4 class="just-text">' + options.content + '</h4>');
            infoWindow.open(options.map, options.marker);

            // Close it in delay seconds.
            setTimeout(function() {
                options.closedCallback();

                // Might have been previously closed.
                if (infoWindow) {
                    infoWindow.close();
                    infoWindow = null;
                }
            }, options.delay);

            return infoWindow;
        },

        open: function(options) {
            this.closeAll();

            options.infoWindow.setContent('<div class="infowindow-wrapper">' + options.content + '</div>');
            options.infoWindow.open(options.map, options.marker);
        },

        closeAll: function() {
            for (var i in instances) {
                if (instances[i]) {
                    // We don't splice as we reuse info windows. Each caller should
                    // manage their info windows life.
                    instances[i].close();
                    instances[i].setMap(null);
                }
            }
        },

        infoBoxStyles: {},

        justTextStyles: {}
    };
});
