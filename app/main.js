define(['GoogleMapsLoader'], function(GoogleMapsLoader) {

    // JS console message.
    console.log('%c Hello! Feel free to hack the game. All user attributes and states are in app/User.js ', 'background: #222; color: #bada55');

    var initGame = function(googleMaps) {

        require(['bs', 'Const', 'Map', 'UI', 'User', 'Game', 'StoryManager', 'ChaseTracker', 'PoisManager', 'PoliticsManager', '../vendor/google/infobox', '../vendor/blackpoolchurch/v3_epoly'], function($, Const, Map, UI, User, Game, StoryManager, ChaseTracker, PoisManager, PoliticsManager) {

            // @param {google.maps.Map}
            var map = Map.init();

            // Initialise UI stuff.
            UI.init();

            // @type {User} The current user.
            var user = new User(map, 'Badass', Const.defaultCharacterPic);

            // Start the game.
            var appGame = new Game();

            // @param {Phaser}
            var game = appGame.getInstance();

            // @type {StoryManager}
            var storyManager = new StoryManager(map, game, user);
            var storyInit = storyManager.init();

            // @param {ChaseTracker}
            var chaseTracker = new ChaseTracker(map, user);

            // @type {PoisManager}
            var poisManager = new PoisManager(map, game, user);

            // @type {PoliticsManager}
            var politicsManager = new PoliticsManager(map, game, user);

            // Move the user to a new position.
            map.addListener('click', function(e) {
                user.moveTo(e.latLng);
            });

            // Once we get user input we start filling the map.
            storyInit.done(function(position) {

                // Search nearby pois and display them on map.
                poisManager.addNearbyPois(position);

                user.gameStarted();

                // Add listeners to user actions for politic-related events.
                politicsManager.setPolitics(position);
            });
        });
    };

    GoogleMapsLoader.done(initGame).fail(function() {
        console.error('Google maps can not be loaded');
    });
});
