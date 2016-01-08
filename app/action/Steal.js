define(['bs', 'Generator', 'Foe', 'UI', 'action/Base'], function($, Generator, Foe, UI, ActionBase) {

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

    function ActionSteal(user, game, poiData, marker) {
        ActionBase.call(this, user, game, poiData, marker);

        this.scenario = Generator.getRandomElement(randomScenarios);

        return this;
    }
    ActionSteal.prototype = Object.create(ActionBase.prototype);
    ActionSteal.prototype.constructor = ActionSteal;

    // This holds the randomly selected scenario.
    ActionSteal.prototype.scenario = null;

    ActionSteal.prototype.getVisibleName = function() {
        return 'Steal';
    }

    ActionSteal.prototype.render = function() {

        // Renderer promise.
        var rendererPromise = $.Deferred();

        // Get the header.
        var headerPromise = this.printHeader();

        // Once we have the header we concat the body and resolve the renderer promise.
        headerPromise.done(function(html) {
            html = html + '<div id="steal-info" class="info-box">' +
                '<p>You can steal $' + this.scenario.loot + ' here... There are ' + this.scenario.guards.length + ' guards... Looks like it would be ' + this.scenario.difficulty + '.' +
                '<p>' + UI.renderActionButtons([{id: 'run', text: 'Steal the money and run!'}]) + '</p></div>';
            rendererPromise.resolve(html);

        }.bind(this));

        return rendererPromise;
    };

    ActionSteal.prototype.rendered = function() {
        $('#run').on('click', function(ev) {
            ev.preventDefault();

            var lootImportance = this.getLootImportance(this.scenario.loot);

            // Get the loot.
            this.user.updateState({
                cWealth: this.user.state.cWealth + this.scenario.loot
            });

            $('#text-action').modal('hide');

            for(var i = 0; i < this.scenario.guards.length; i++) {

                var chaseData = Generator.chaseData(
                    lootImportance,
                    this.user,
                    this.scenario.guards[i],
                    this.poiData.geometry.location
                );
                chaseData.caughtCallback = this.punish.bind(this);

                $('#map').trigger('chase:add', [chaseData]);
            }

            // You get the experience even if they catch you.
            this.user.addExperience(lootImportance * 20);
            this.doneCallback();

        }.bind(this));
    };

    ActionSteal.prototype.punish = function() {

        this.user.updateState({
            cWealth: this.user.state.cWealth - this.scenario.loot,
            cHealth: this.user.state.cHealth - this.scenario.guardsDamage
        });

        $('#steal-info').html("<p>I've caught you mate! You will swallow this punch!<br/>" +
            "(They punched you and recovered the money you have stolen them)</p>");

        $('#text-action').modal('show');
    };

    ActionSteal.prototype.getLootImportance = function(loot) {

        if (loot < 100) {
            return 2;
        } else if (loot < 300) {
            return 4;
        } else if (loot < 500) {
            return 5;
        } else if (loot < 700) {
            return 6;
        } else if (loot < 1000) {
            return 7;
        } else if (loot < 1300) {
            return 8
        } else if (loot < 1600) {
            return 8.5;
        } else if (loot < 2000) {
            return 9;
        }

        return 10;
    };

    return ActionSteal;
});
