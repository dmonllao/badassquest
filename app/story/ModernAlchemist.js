define(['jquery', 'story/Base', 'Icon', 'Mission'], function($, StoryBase, Icon, Mission) {

    ModernAlchemist.prototype = Object.create(StoryBase.prototype);

    function ModernAlchemist(user, game) {
        StoryBase.call(this, user, game);

        this.title = 'The modern alchemist';

        // Near alhambra de Granada.
        this.initialPosition = {lat: 37.17309393, lng: -3.59197408};

        // Setting them in here as google.maps will already be available.
        this.missions = [
            new Mission({
                content: 'The dog poes, which makes you happy. Now you can return to the city, one less walk before going to Sarah\'s home'
            }),
            new Mission({
                content: 'Thanks ' + this.user.playerName + '. Spike looks very happy, I\'m sure that he discharged a big one. How are you? I\'ve heard that you are having clients in nearby villages, that is good, but don\'t forget about us. With these $50 I pay you all I owed you. See you soon.',
                process: function() {
                    this.user.updateState({
                        cWealth: this.state.cWealth + 50
                    });
                }
            }),
        ];
    }

    ModernAlchemist.prototype.getIntro = function() {
        return this.user.playerName + ' the dog walker they call you, mind controller you like to be called. They pay you to walk their dogs, it is fine for you because it allows you to see different parks and villages.';
    };

    ModernAlchemist.prototype.getTheEnd = function() {
        return '';
    };

    return ModernAlchemist;
});
