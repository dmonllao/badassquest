define(['Phaser', 'Util', 'state/Empty', 'state/Fight'], function(Phaser, Util, StateEmpty, StateFight) {

    function Game() {
        return this;
    }

    Game.prototype = {

        getInstance: function() {
            var size = Util.getGameSize();
            var game = new Phaser.Game(size.width, size.height, Phaser.CANVAS, 'game-action-content');

            // Start the empty state. Actions will add their own states.
            game.state.add('Empty', StateEmpty);
            game.state.start('Empty');

            return game;
        }
    };

    return Game;
});
