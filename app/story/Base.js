define(['jquery', 'Icon', 'StoryStep'], function($, Icon, StoryStep) {

    function StoryBase(user, game) {
        this.user = user;
        this.game = game;

        // Setting them in here as google.maps will already be available.
        this.steps = [
        ];
    }

    StoryBase.prototype = {

        title: '(overwrite me)',

        initialPosition: null,

        zoom: 18,

        user: null,
        game: null,

        steps: null,

        getIntro: function() {
            console.error('getIntro should be overwriten');
            return '';
        },

        getTheEnd: function() {
            console.error('getTheEnd should be overwriten');
            return '';
        },
    };

    return StoryBase;
});
