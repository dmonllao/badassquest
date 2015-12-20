var google_maps_loaded_def = null;

define(['bs'], function($) {

    if(!google_maps_loaded_def) {

        google_maps_loaded_def = $.Deferred();

        window.google_maps_loaded = function() {
            google_maps_loaded_def.resolve(google.maps);
        };

        require(['https://maps.googleapis.com/maps/api/js?libraries=places,geometry&key=AIzaSyCPp5yVSIGbV54-tumH4Zay61o9xpy_1qw&callback=google_maps_loaded'],function(){},function(err) {
            google_maps_loaded_def.reject();
        });
    }
    return google_maps_loaded_def.promise();
});

