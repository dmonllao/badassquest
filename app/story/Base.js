define(['bs'], function($) {

    function StoryBase(user, game) {
        this.user = user;
        this.game = game;

        // Setting them in here as google.maps will already be available.
        this.missions = [
        ];
    }

    StoryBase.prototype = {

        title: '(overwrite me)',

        initialPosition: null,

        zoom: 17,

        user: null,
        game: null,

        missions: null,

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
