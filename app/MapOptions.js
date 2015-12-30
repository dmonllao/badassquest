define(function() {

    var mapStyles = [
        {
            "featureType": "poi",
            "stylers": [
                { "visibility": "off" }
            ]
        }, {
            "featureType": "poi.park",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        }, {
            "featureType": "transit.station",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        }, {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        }, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        }, {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        }, {
            "featureType": "administrative.land_parcel",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        }, {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        }, {
            "featureType": "road.local",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        }, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#84afa3"
                },
                {
                    "lightness": 52
                }
            ]
        }, {
            "featureType": "all",
            "elementType": "all",
            "stylers": [
                {
                    "saturation": -17
                },
                {
                    "gamma": 0.36
                }
            ]
        }, {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#3f518c"
                }
            ]
        }
    ];

    function MapOptions() {
        // We want this here as we need google.maps to be available when this is called.
        this.mapTypeId = google.maps.MapTypeId.ROADMAP;
    }

    MapOptions.prototype = {
        zoom: 17,
        mapTypeControl: false,
        styles: mapStyles,
        mapTypeId: null, 
        zoomControl: false,
        rotateControl: false,
        streetViewControl: false
    };

    return MapOptions;
});
