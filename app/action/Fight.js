define(['bs', 'Foe', 'Icon', 'action/Base'], function($, Foe, Icon, ActionBase) {

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

        // Thumbs down and red. green: '#54D94F'
        this.doneIcon = Icon.getByFont('THUMBS_DOWN', '#d9534f', 0.5);

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
