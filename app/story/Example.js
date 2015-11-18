define(['jquery', 'story/Base', 'Icon', 'StoryStep'], function($, StoryBase, Icon, StoryStep) {

    Example.prototype = Object.create(StoryBase.prototype);

    function Example(playerName) {

        this.title = 'Bad ass Quest Example';

        // West Perth.
        this.initialPosition = {lat: -31.948357, lng: 115.8408308};

        this.playerName = playerName;

        // Setting them in here as google.maps will already be available.
        this.steps = [
            // Specify everything in here; name, position and icon have preference over the place ones.
            new StoryStep({
                name: 'Random witness',
                placeid: 'ChIJL_U8syG7MioRJxobWh5So7k',
                position: new google.maps.LatLng(-31.94822952, 115.84812641),
                icon: Icon.getByType('idea', 1),
                cleanStep: true,
                info: 'Hi mate, I haven\'t really seen anything, just someone running. Probably worth going to the police station.'
            }),
            // Just custom data, no need to point to real places.
            new StoryStep({
                name: 'Perth Police Station',
                position: new google.maps.LatLng(-31.946606, 115.852482),
                icon: Icon.getByType('police', 1),
                info: 'Let\'s go to the Bell Tower.'
            }),
            // All poi data is contained in the place.
            new StoryStep({
                placeid: 'ChIJI0gEfSm7MioR7yWId2npZcg',
                icon: Icon.getByType('institution', 1),
                info: 'Finished.'
            })
        ];
    }

    Example.prototype.getIntro = function() {
        return 'You are ' + this.playerName + ', father of Bubitz. While paying for the meatballs you was supposed to eat at lunch Bubitz has been kidnapped, you have no idea where she might be. Someone tells you that a wintess is waiting for you near Harbour Town.';
    };

    Example.prototype.getTheEnd = function() {
        return 'You found her there. Lucky you that the mother didn\'t realise.';
    };

    return Example;
});
