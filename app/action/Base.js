define(['bs', 'External'], function($, External) {

    function ActionBase(user, game, marker, poiData) {
        this.user = user;
        this.game = game;
        this.marker = marker;
        this.poiData = poiData;
        return this;
    }

    ActionBase.prototype = {

        user: null,
        game: null,
        poiData: null,

        shopKeeperImage: null,

        getVisibleName: function() {
            console.error('Base class should be extended');
            return '';
        },

        getRandomElement: function(elements) {
            var randomIndex = Math.floor(Math.random() * elements.length);
            return elements[randomIndex];
        },

        /**
         * The action type.
         *
         * It can be text-action or game-action depending on whether a new game
         * state is defined to complete the action or just html based interactions.
         */
        getActionType: function() {
            return 'text-action';
        },

        render: function() {
            // We have to maintain the interface which returns a promise.
            var deferred = $.Deferred();
            deferred.resolve('');

            // Execute the action finished callback.
            // This does nothing as this base action is not modifying the user state. Example:
            // this.user.updateState({
            //     cHealth: 100,
            //     cWealth: 40
            // });

            return deferred;
        },

        printHeader: function() {

            var promise = $.Deferred();

            // Will hold the random person to use.
            var personPromise = External.getRandomPersonImage();
            personPromise.done(function(randomImageUrl) {
                this.shopKeeperImage = randomImageUrl;
                promise.resolve(
                    '<div class="action-header row">' +
                        '<div class="col-sm-2"><img src="' + this.shopKeeperImage + '" class="img-responsive img-circle"/></div>' +
                        '<div class="col-sm-8"><h4>Welcome to ' + this.poiData.name + '</h4></div>' +
                        '<div class="col-sm-2"><img width="48" height="48" src="' + this.user.photo + '" class="img-responsive img-circle"/></div>' +
                    '</div>'
                );
            }.bind(this));

            return promise;
        },

        closeAction: function(ev) {

            if (typeof ev !== "undefined") {
                ev.preventDefault();
            }

            $('#text-action').modal('hide');
        }
    }

    return ActionBase;
});
