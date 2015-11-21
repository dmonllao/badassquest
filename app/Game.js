define(['bs', 'Phaser', 'Util', 'state/Empty', 'state/Fight'], function($, Phaser, Util, StateEmpty, StateFight) {

    function Game() {
        return this;
    }

    Game.prototype = {

        getInstance: function() {
            var size = Util.getGameSize();
            var game = new Phaser.Game(size.width, size.height, Phaser.CANVAS, 'game-action-content');

            // Update canvas size on resize.
            $(window).resize(function() {
                var size = Util.getGameSize();
                game.width = size.width;
                game.height = size.height;
            });

            // Start the empty state. Actions will add their own states.
            game.state.add('Empty', StateEmpty);
            game.state.start('Empty');

            // Add the state to the game.
            game.state.add('Fight', StateFight);

            return game;
        }
    };

    return Game;
});
