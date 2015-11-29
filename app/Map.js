define(['MapOptions', 'InfoWindow', 'epoly', 'infobox'], function(MapOptions, InfoWindow) {

    var map = null;

    var placesService = null;

    return {

        init: function() {
            var mapOptions = new MapOptions();
            map = new google.maps.Map(document.getElementById('map'), mapOptions);

            // We init them after google object is available.
            InfoWindow.initStyles();

            return map;
        },

        getPlacesService: function() {

            if (map === null) {
                console.error('PlacesService can not be initalised, the map is not ready.');
            }
            placesService = new google.maps.places.PlacesService(map);
            return placesService;
        }
    }
});
