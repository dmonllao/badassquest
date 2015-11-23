define(function() {

    var instances = [];

    return {
        getInstance: function(options, addToList) {

            if (typeof addToList === "undefined") {
                addToList = true;
            }

            var infoWindow = new google.maps.InfoWindow(options);

            if (addToList) {
                instances.push(infoWindow);
            }
            return infoWindow;
        },

        openPissedInstance: function(map, marker, content, closedCallback, delay) {

            if (typeof delay === "undefined") {
                delay = 2000;
            }

            var infoWindow = new google.maps.InfoWindow({
                content: content
            });
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
