define(['jquery', 'story/Base'], function($, StoryBase) {

    Free.prototype = Object.create(StoryBase.prototype);

    function Free(user, game) {
        StoryBase.call(this, user, game);
        this.title = 'Bad Ass Quest';
    }

    Free.prototype.getIntro = function() {
        return '<div>Terrorize the city.</div><div><input id="place-input" class="form-control"/></div>';
    };

    Free.prototype.getPosition = function(map, initialPositionPromise, callback) {

        var input = document.getElementById('place-input');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.setTypes(['geocode']);
        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                console.error("Autocomplete's returned place contains no geometry");
                return;
            }
            callback(place.geometry.location);
            $('#text-action').modal('hide');
        });
    };

    return Free;
});
