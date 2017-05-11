define(['bs', 'Generator', 'Foe', 'UI', 'action/Base', 'Sound'], function($, Generator, Foe, UI, ActionBase, Sound) {

    // Difficulty is only there to make things easy later.
    var randomScenarios = [
        {
            difficulty: 'hard',
            loot: 200,
            guardsDamage: 70,
            guards: ['Yosu', 'Ramon']
        },
        {
            difficulty: 'hard',
            loot: 150,
            guardsDamage: 70,
            guards: ['Ramon']
        },
        {
            difficulty: 'feasible',
            loot: 100,
            guardsDamage: 50,
            guards: ['Yosu', 'Ramon']
        },
        {
            difficulty: 'feasible',
            loot: 80,
            guardsDamage: 40,
            guards: ['Ramon']
        },
        {
            difficulty: 'easy',
            loot: 50,
            guardsDamage: 30,
            guards: ['Joselito']
        }
    ];

    function ActionSteal(user, game, poiData, marker) {
        ActionBase.call(this, user, game, poiData, marker);

        this.scenario = Generator.getRandomElement(randomScenarios);

        // It should depend on the level.
        this.scenario.loot = this.scenario.loot * (this.user.state.level / 2);
        this.scenario.guardsDamage = this.scenario.guardsDamage + (this.user.state.level * 5);

        this.stealText = null;

        return this;
    }
    ActionSteal.prototype = Object.create(ActionBase.prototype);
    ActionSteal.prototype.constructor = ActionSteal;

    // This holds the randomly selected scenario.
    ActionSteal.prototype.scenario = null;

    ActionSteal.prototype.getName = function() {
        return 'ActionSteal';
    }

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
                '<p>' + UI.renderActionButtons([{id: 'run', text: 'Steal the money and run!'}, {id: 'cancel', text: 'Cancel'}]) + '</p></div>';
            rendererPromise.resolve(html);

        }.bind(this));

        return rendererPromise;
    };

    ActionSteal.prototype.rendered = function() {

        // Grab a copy as we later need the header again.
        this.stealText = $('#text-action-content').html();

        $('#cancel').on('click', function(ev) {
            $('#text-action').modal('hide');
        });
        $('#run').on('click', function(ev) {
            ev.preventDefault();

            var lootImportance = this.getLootImportance(this.scenario.loot);

            Sound.play('achievement');

            if (localStorage.getItem('achievementSteal1') === null) {
                this.user.addAchievement({
                    category: 'basics',
                    id: 'steal-1',
                    title: 'Pickpocket noob',
                    image: '<i class=\"fa fa-money\" style=\"color: #95c355;\"></i>'
                });
                localStorage.setItem('achievementSteal1', true)
            }

            // Get the loot.
            this.user.updateState({
                cWealth: this.user.state.cWealth + this.scenario.loot
            });

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

        $('#text-action-content').html(this.stealText);
        $('#steal-info').html("<p>I've caught you mate! You will swallow this punch!" + UI.getPunch() + "<br/>" +
            "(They punched you and recovered the money <i class=\"fa fa-money\" style=\"color: #95c355;\"></i> you have stolen them)</p>");

        UI.showModal($('#text-action-content').html(), 'Continue', 'btn btn-warning');

        this.user.updateState({
            cWealth: this.user.state.cWealth - this.scenario.loot,
            cHealth: this.user.state.cHealth - this.scenario.guardsDamage
        });
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
