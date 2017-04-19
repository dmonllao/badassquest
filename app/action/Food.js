define(['bs', 'UI', 'action/Base', 'Generator', 'Sound'], function($, UI, ActionBase, Generator, Sound) {

    // TODO Change this, but I'm not convinced how could depend on the user.
    var randomFood = [
        {
            name: 'Fish and chips',
            price: 10,
            health: 10,
            energy: 400
        }, {
            name: 'Serranito sandwich',
            price: 10,
            health: 10,
            energy: 400
        }, {
            name: 'Burger',
            price: 20,
            health: 20,
            energy: 800
        }, {
            name: 'Pizza',
            price: 30,
            health: 30,
            energy: 1000
        }, {
            name: 'Paella',
            price: 40,
            health: 40,
            energy: 1500
        }, {
            name: 'Beef steak',
            price: 50,
            health: 50,
            energy: 2000
        }
    ];

    function ActionFood(user, game, poiData, marker) {
        ActionBase.call(this, user, game, poiData, marker);

        this.food = Generator.getRandomElement(randomFood);

        return this;
    }
    ActionFood.prototype = Object.create(ActionBase.prototype);
    ActionFood.prototype.constructor = ActionFood;

    ActionFood.prototype.food = null;

    ActionFood.prototype.getVisibleName = function() {
        return 'Eat something';
    }

    ActionFood.prototype.isUserFollowed = function() {

        // Depending on the price it is more likely that the guy runs after you.
        // Converts from a food price scale to a value from 0 to 10.
        var will = this.getFoodImportance(this.food.price);

        if (Math.random() * 10 > will) {
            return false;
        }

        return true;
    };

    ActionFood.prototype.getFoodImportance = function(price) {
        if (price < 15) {
            return 2;
        } else if (price < 40) {
            return 4;
        } else if (price < 60) {
            return 6;
        } else if (price < 100) {
            return 8;
        }
        return 10;
    };

    ActionFood.prototype.render = function() {
        var rendererPromise = $.Deferred();

        // Get the header
        var headerPromise = this.printHeader();

        // Once we have the header we concat the body and resolve the renderer promise.
        headerPromise.done(function(html) {

            // Same button color order than when multiple actions.
            rendererPromise.resolve(
                html +
                '<div id="food-info" class="info-box">' +
                '<p>I hope you enjoy your lovely ' + this.food.name + '. $' + this.food.price + ' please.' +
                    'You can recover ' + this.food.health + ' life points with it and ' + this.food.energy + ' energy points.</p>' +
                UI.renderActionButtons([
                    {
                        id: 'pay',
                        text: 'Pay'
                    }, {
                        id: 'run',
                        text: 'Run with the ' + this.food.name
                    }, {
                        id: 'cancel',
                        text: 'I don\'t want it'
                    }
                ]) + '</div>'
            );
        }.bind(this));

        return rendererPromise;
    };

    ActionFood.prototype.rendered = function() {

        // We will need it later to assign experience or possible chase against it.
        var foodImportance = this.getFoodImportance(this.food.price);

        $('#pay').on('click', function(ev) {

            if (this.user.state.cWealth < this.food.price) {
                $('#food-info').html("<p>You can not afford it mate, get out.</p>");
                return;
            }

            this.closeAction(ev);

            this.user.updateState({
                cHealth: this.user.state.cHealth + this.food.health,
                cFood: this.user.state.cFood + this.food.energy,
                cWealth: this.user.state.cWealth - this.food.price
            });

            Sound.play('heal');

            // Just paying is not "awesome".
            this.user.addExperience(foodImportance * 4);
            this.doneCallback();

        }.bind(this));

        $('#run').on('click', function(ev) {
            ev.preventDefault();

            // Initially applying the "escaped" results.
            this.user.updateState({
                cHealth: this.user.state.cHealth + this.food.health,
                cFood: this.user.state.cFood + this.food.energy,
            });

            Sound.play('heal');

            this.user.addExperience(foodImportance * 10);
            this.doneCallback();

            if (!this.isUserFollowed()) {
                $('#food-info').html("<p>You escaped and nobody followed you!</p>");
                return;
            }

            // Close it while the user is being chased.
            $('#text-action').modal('hide');

            // Start a chase, the insistence depends on the item price.
            var chaseData = Generator.chaseData(
                foodImportance,
                this.user,
                this.poiData.name,
                this.poiData.geometry.location
            );
            chaseData.caughtCallback = this.punish.bind(this);

            $('#map').trigger('chase:add', [chaseData]);

        }.bind(this));

        $('#cancel').on('click', function(ev) {
            this.closeAction(ev);
        }.bind(this));

    };

    ActionFood.prototype.punish = function() {

        // Push the updated data. updateState() will limit the values.
        this.user.updateState({
            cHealth: this.user.state.cHealth - (this.food.health * 2),
            cWealth: this.user.state.cWealth - (this.food.price * 2)
        });

        // Show the results in a modal window.
        $('#food-info').html("<p>I've caught you mate! You will swallow this punch!<br/>(They punched you and stole some of your money)</p>");
        UI.showModal($('#text-action-content').html(), 'Continue', 'btn btn-warning');
    };

    return ActionFood;
});
