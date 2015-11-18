define(['bs', 'Foe', 'action/Base', 'state/Fight'], function($, Foe, ActionBase, StateFight) {

    ActionFight.prototype = Object.create(ActionBase.prototype);

    function ActionFight(user, game, marker, poiData) {
        ActionBase.call(this, user, game, marker, poiData);

        // TODO This should depend on poiData.
        this.foes = [
            new Foe({
                name: 'Josefino',
                tHealth: 100,
                speed: 3,
                attack: 2,
                defense: 8,
                duration: 10000,
                reRouteLimit: 3
            }),
            new Foe({
                name: 'Rodolfo',
                tHealth: 70,
                speed: 5,
                attack: 7,
                defense: 5,
                duration: 20000,
                reRouteLimit: 2
            })
        ];

        return this;
    }

    ActionFight.prototype.getActionType = function() {
        return 'game-action';
    }

    ActionFight.prototype.getVisibleName = function() {
        return 'Fight';
    }

    ActionFight.prototype.setState = function() {

        // Add the state to the game.
        this.game.state.add('Fight', StateFight);

        // Returns a promise.
        var gamePromise = $.Deferred();

        // TODO Rename it, only used to ensure we got the shop keeper.
        var headerPromise = this.printHeader();
        headerPromise.done(function(unused) {

            // All foes using the same image.
            for (var i in this.foes) {
                this.foes[i].setFaceImage(this.shopKeeperImage);

                // We need to set the user too so they can attack.
                this.foes[i].setUser(this.user);
            }

            // We pass the action object and the state id to initiate.
            gamePromise.resolve('Fight');

        }.bind(this));

        return gamePromise;
    };

    return ActionFight;
});
