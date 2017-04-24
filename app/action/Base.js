define(['bs', 'Generator', 'Icon'], function($, Generator, Icon) {

    function ActionBase(user, game, poiData, marker) {
        this.user = user;
        this.game = game;
        this.poiData = poiData;
        this.marker = marker;

        this.doneCallback = function(){};

        return this;
    }

    ActionBase.prototype = {

        user: null,
        game: null,
        poiData: null,

        doneCallback: null,

        /**
         * The marker is not always available, when the action is part of a
         * mission the MissionsChain has control over the marker.
         */
        marker: null,

        shopKeeperImage: null,

        /**
         * Default icon when marking as done.
         */
        doneIcon: Icon.getByType('angry', 0.5),

        getName: function() {
            // Important to set it to ActionXXX because optimization process
            // renames classes.
            console.error('Base class should be extended');
            return '';
        },

        getVisibleName: function() {
            console.error('Base class should be extended');
            return '';
        },

        start: function(doneCallback) {

            ga('send', 'event', this.getName(), 'start');

            // It does not necessarily has a value.
            if (doneCallback) {
                this.doneCallback = doneCallback;
            }

            // Actions may include async calls.
            var promise = this.render();
            promise.done(function(html) {

                if (!html) {
                    return;
                }

                // Promises returned by action's render methods should just return an HTML string.
                document.getElementById('text-action-content').innerHTML = html;

                $('#text-action').modal('show');

                // Notify the action that html has been rendered.
                if (typeof this.rendered === 'function') {
                    this.rendered();
                }
            }.bind(this));

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
            var personPromise = Generator.getRandomPersonImage();
            personPromise.done(function(randomImageUrl) {
                this.shopKeeperImage = randomImageUrl;
                promise.resolve(
                    '<div class="action-header row">' +
                        '<div class="col-sm-2"><img src="' + this.shopKeeperImage + '" class="img-responsive img-circle"/></div>' +
                        '<div class="col-sm-8"><h4>Welcome to ' + this.poiData.name + '</h4></div>' +
                        '<div class="action-player-pic col-sm-2"><img width="48" height="48" src="' + this.user.photo + '" class="img-responsive img-circle"/></div>' +
                    '</div>'
                );
            }.bind(this));

            return promise;
        },

        /**
         * Marks a poi as done.
         *
         * @param {bool} pissed
         * @param {icon:string|Icon|Symbol} icon
         * @param {bool} clearPoi
         */
        markAsDone: function(pissed, icon, clearPoi) {

            ga('send', 'event', this.getName(), 'done');

            // The marker might be null if this action is part of a mission.
            if (!this.marker) {
                return;
            }

            if (icon === true) {
                // By default set it to the shop keeper's image.
                icon = Icon.getByType('done', 0.5);
            }

            if (icon) {
                this.marker.setIcon(icon);
            }

            // Clear the marker.
            if (clearPoi) {
                this.marker.setClickable(false);
                google.maps.event.clearInstanceListeners(this.marker);
            }

            // Add to pissed off markers if specified.
            if (pissed) {
                this.user.pissed.add({
                    marker: this.marker
                });
            }

            // Add the marker to the user controlled pois.
            this.user.controlledAreas.addPoi({
                poiData: this.poiData,
                marker: this.marker
            });
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
