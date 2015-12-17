define(['bs', 'Generator', 'Icon', 'Foe', 'action/Base'], function($, Generator, Icon, Foe, ActionBase) {

    ActionFight.prototype = Object.create(ActionBase.prototype);

    function ActionFight(user, game, marker, poiData) {
        ActionBase.call(this, user, game, marker, poiData);

        this.foes = Generator.foes(this.poiData);

        return this;
    }

    ActionFight.prototype.getActionType = function() {
        return 'game-action';
    }

    ActionFight.prototype.getVisibleName = function() {
        return 'Kill\'em all';
    }

    ActionFight.prototype.start = function() {

        // Only used to ensure we got the shop keeper.
        var headerPromise = this.printHeader();
        headerPromise.done(function(unused) {

            // All foes using the same image.
            for (var i in this.foes) {
                this.foes[i] = new Foe(this.foes[i]);
                this.foes[i].setFaceImage(this.shopKeeperImage);
            }

            // Start the selected state passing the action arguments.
            var args = {
                user: this.user,
                foes: this.foes,
                location: this.poiData.vicinity,
                wonCallback: this.markAsDone.bind(this)
            };
            this.game.state.start('Fight', true, false, args);

            $('#game-action').modal('show');

        }.bind(this));
    };

    return ActionFight;
});
