define(['bs', 'Map', 'User', 'Game', 'StoryManager', 'ChaseTracker', 'PoisManager'], function($, Map, User, Game, StoryManager, ChaseTracker, PoisManager) {

    // @param {ChaseTracker}
    var chaseTracker;

    // @type {PoisManager}
    var poisManager;

    // @param {Controls}
    var controls = null;

    // @type {StoryManager}
    var storyManager = null;

    // @param {google.maps.Map}
    var map = Map.init();

    var placesService = Map.getPlacesService();

    // @type {User} The current user.
    var user = new User(map, 'Juanito', 'img/mushroom2.png');

    // Start the game.
    var appGame = new Game();

    // @param {Phaser}
    var game = appGame.getInstance();

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
