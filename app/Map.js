define(['MapOptions', 'InfoWindow'], function(MapOptions, InfoWindow) {

    var map = null;

    var placesService = null;

    var geocoder = null;

    return {

        init: function() {
            var mapOptions = new MapOptions();
            map = new google.maps.Map(document.getElementById('map'), mapOptions);

            var panorama = map.getStreetView();
            panorama.set('addressControl', false);
            panorama.set('zoomControl', false);
            panorama.set('fullscreenControl', false);
            panorama.set('enableCloseButton', false);
            panorama.set('linksControl', true);
            panorama.set('panControl', false);

            // We init them after google object is available.
            InfoWindow.initStyles();

            return map;
        },

        getPlacesService: function() {

            if (map === null) {
                console.error('PlacesService can not be initalised, the map is not ready.');
            }

            if (placesService !== null) {
                return placesService;
            }

            placesService = new google.maps.places.PlacesService(map);
            return placesService;
        },

        getGeocoder: function() {

            if (geocoder !== null) {
                return geocoder;
            }

            geocoder = new google.maps.Geocoder();
            return geocoder;
        }
    }
});
