define(['bs', 'Generator', 'UI', 'Foe', 'action/Steal'], function($, Generator, UI, Foe, ActionSteal) {

    // Difficulty is only there to make things easy later.
    var randomScenarios = [
        {
            difficulty: 'hard',
            loot: 200,
            guardsDamage: 70,
            guards: ['Yosu', 'Ramon']
        },
        {
            difficulty: 'easy',
            loot: 50,
            guardsDamage: 50,
            guards: ['Joselito']
        }
    ];

    function ActionHack(user, game, poiData, marker) {
        ActionSteal.call(this, user, game, poiData, marker);

        this.scenario = Generator.getRandomElement(randomScenarios);

        return this;
    }
    ActionHack.prototype = Object.create(ActionSteal.prototype);
    ActionHack.prototype.constructor = ActionHack;

    // This holds the randomly selected scenario.
    ActionHack.prototype.scenario = null;

    ActionHack.prototype.getName = function() {
        return 'ActionHack';
    }

    ActionHack.prototype.getVisibleName = function() {
        return 'Hack it';
    }

    ActionHack.prototype.render = function() {

        // Renderer promise.
        var rendererPromise = $.Deferred();

        var header = '<div class="action-header row"><h4>Welcome to ' + this.poiData.name + '</h4></div>';
        var html = header + '<div id="steal-info" class="info-box">' +
            '<p>You can steal $' + this.scenario.loot + ' here... There are ' + this.scenario.guards.length + ' guards... Looks like it would be ' + this.scenario.difficulty + '.' +
            '<p>' + UI.renderActionButtons([{id: 'run', text: 'Hack it and run!'}, {id: 'cancel', text: 'Cancel'}]) + '</p>' +
            '</div>';
        rendererPromise.resolve(html);

        return rendererPromise;
    };

    return ActionHack;
});
