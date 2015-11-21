define(['bs', 'User', 'Game', 'StoryManager', 'ChaseTracker', 'PoisManager', 'MapOptions'], function($, User, Game, StoryManager, ChaseTracker, PoisManager, MapOptions) {

    // @param {ChaseTracker}
    var chaseTracker;

    // @type {PoisManager}
    var poisManager;

    // @param {Controls}
    var controls = null;

    // @param {google.maps.Map}
    var map;

    // @param {Phaser}
    var game;

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

            // Start the game.
            var appGame = new Game();
            game = appGame.getInstance();

            storyManager = new StoryManager(placesService, map, game, user);

            chaseTracker = new ChaseTracker(map, user);

            poisManager = new PoisManager(placesService, map, game, user);

            // Search near by pois.
            poisManager.addNearbyPois(storyManager.story.initialPosition);

            // Move the user to a new position.
            map.addListener('click', function(e) {
                console.log('Move to ' + e.latLng);
                user.moveTo(e.latLng);
            });
        });
    }

    // Execute initMap onload.
    window.onload = initMap;
});
