define(['bs', 'User', 'StoryManager', 'ChaseTracker', 'PoisManager', 'MapOptions'], function($, User, StoryManager, ChaseTracker, PoisManager, MapOptions) {

    // @param {ChaseTracker}
    var chaseTracker;

    // @type {PoisManager}
    var poisManager;

    // @param {Controls}
    var controls = null;

    // @param {google.maps.Map}
    var map;

    // @type {User}
    var user = null;

    // @type {StoryManager}
    var storyManager = null;

    function initMap() {

        var mapOptions = new MapOptions();

        // New map instance.
        map = new google.maps.Map(document.getElementById('map'), mapOptions);

        google.maps.event.addListenerOnce(map, 'idle', function() {

            var placesService = new google.maps.places.PlacesService(map);

            // The current user.
            user = new User(map, 'Juanito', 'img/mushroom2.png');

            storyManager = new StoryManager(placesService, map, user);

            chaseTracker = new ChaseTracker(map, user);

            poisManager = new PoisManager(placesService, map, user);

            // Search near by pois.
            poisManager.addNearbyPois(storyManager.story.initialPosition);

            // Move the user to a new position.
            map.addListener('click', function(e) {
                user.moveTo(e.latLng);
            });
        });
    }

    // Execute initMap onload.
    window.onload = initMap;
});
