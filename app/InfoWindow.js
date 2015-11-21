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

        closeAll: function() {
            for (var i in instances) {
                instances[i].close();
            }
        },

        open: function(infoWindow, map, marker) {
            this.closeAll();
            infoWindow.open(map, marker);
        }
    };
});
