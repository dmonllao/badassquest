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

        currentStep: null,

        user: null,
        game: null,

        steps: null,

        getIntro: function() {
            console.error('getIntro should be overwriten');
            return '';
        },

        init: function() {
            // No default implementation, this is called when the story is ready to start.
        },

        getTheEnd: function() {
            console.error('getTheEnd should be overwriten');
            return '';
        },

        getNextStep: function() {
            if (this.currentStep === null) {
                this.currentStep = 0;
            } else {
                this.currentStep++;
            }

            if (typeof this.steps[this.currentStep] === "undefined") {
                return false;
            }

            // Provide data to the step.
            this.steps[this.currentStep].setUser(this.user);
            this.steps[this.currentStep].setGame(this.game);

            return this.steps[this.currentStep];
        }
    };

    return StoryBase;
});
