define(['bs', 'Map', 'User', 'Game', 'StoryManager', 'ChaseTracker', 'PoisManager', 'PoliticsManager'], function($, Map, User, Game, StoryManager, ChaseTracker, PoisManager, PoliticsManager) {

    // @param {Controls}
    var controls = null;

    // @param {google.maps.Map}
    var map = Map.init();

    // @param {google.maps.PlacesService}
    var placesService = Map.getPlacesService();

    // @type {User} The current user.
    var user = new User(map, 'Juanito', 'img/mushroom2.png');

    // Start the game.
    var appGame = new Game();

    // @param {Phaser}
    var game = appGame.getInstance();

    // @type {StoryManager}
    var storyManager = new StoryManager(placesService, map, game, user);
    var storyInit = storyManager.init();

    // @param {ChaseTracker}
    var chaseTracker = new ChaseTracker(map, user);

    // @type {PoisManager}
    var poisManager = new PoisManager(placesService, map, game, user);

    // @type {PoliticsManager}
    var politicsManager = new PoliticsManager(placesService, map, user);

    // Once we get user input we start filling the map
    storyInit.done(function(position) {

        // Search nearby pois and display them on map.
        poisManager.addNearbyPois(position);

        // Add listeners to user actions for politic-related events.
        politicsManager.setPolitics(position);

        // Move the user to a new position.
        map.addListener('click', function(e) {
            user.moveTo(e.latLng);
        });
    });
});
