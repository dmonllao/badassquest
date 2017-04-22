define(['bs', 'Map', 'story/Base'], function($, Map, StoryBase) {

    Free.prototype = Object.create(StoryBase.prototype);

    function Free(user, game) {
        StoryBase.call(this, user, game);
    }

    Free.prototype.getTitle = function() {
        var spinningMoney = '<i class="fa fa-money fa-spin fa-lg" style="color: green;"></i>';
        return spinningMoney + '&nbsp;Badass Quest&nbsp;' + spinningMoney;
    };

    Free.prototype.getIntro = function() {
        return '<div>Terrorize the city.</div><div><input id="place-input" class="form-control" placeholder="Enter a city"/></div>';
    };

    Free.prototype.getPosition = function(map, initialPositionPromise, callback) {

        var input = document.getElementById('place-input');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.setTypes(['geocode']);
        autocomplete.bindTo('bounds', map);
        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                // Fallback to geocoder.
                this.getCurrentLocationSelection(callback);
                return;
            }
            callback(place.geometry.location);
            $('#text-action').modal('hide');
        }.bind(this));
    };

    Free.prototype.getCurrentLocationSelection = function(callback) {
        var geocoder = Map.getGeocoder();
        var currentValue = $('#place-input').val();
        geocoder.geocode({"address": currentValue}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                callback(results[0].geometry.location);
                $('#text-action').modal('hide');
            }
        });
    };

    return Free;
});
