define(['bs', 'Const', 'UI', 'Util', 'InfoWindow', 'action/Cure', 'action/Food', 'action/Steal', 'action/Hack', 'action/Fight', 'action/Extort', 'action/Buy', 'External', 'Icon'], function($, Const, UI, Util, InfoWindow, ActionCure, ActionFood, ActionSteal, ActionHack, ActionFight, ActionExtort, ActionBuy, External, Icon) {

    var enableButtons = function(position) {
        $('.start-action').attr('disabled', false);
    };

    /**
     * Actions available even after you bought them.
     * @type {Array}
     */
    var propertyActions = ["ActionCure", "ActionFood"];

    function PoisManager(placesService, map, game, user) {
        this.placesService = placesService;
        this.map = map;
        this.game = game;
        this.user = user;

        // Now that google.maps is available.
        this.infoWindow = InfoWindow.getInstance();

        this.typeActions = {
            health: [ActionCure],
            shop: [ActionSteal, ActionExtort, ActionBuy],
            wealth: [ActionSteal, ActionFight],
            hackable: [ActionHack],
            food: [ActionFood, ActionExtort, ActionBuy],
        };

        this.poiTypes = {
            hospital: 'health',
            doctor: 'health',
            shopping_mall: 'shop',
            bank: 'wealth',
            atm: 'hackable',
            restaurant: 'food',
            bar: 'food'
        };

        // This list should be slow as there is 1 place API query for each element.
        this.searchGroups = [
            ['hospital', 'doctor', 'bank', 'atm'],
            ['restaurant', 'bar']
        ];

        $('#game-action').on('hidden.bs.modal', function (e) {

            // Cleanup the current state.
            var state = this.game.state.getCurrentState();
            state.finishFight();

            // Move to the empty one.
            this.game.state.start('Empty');
        }.bind(this));

        $('#map').on('pois:get', this.getNearbyPois.bind(this));

        return this;
    }

    PoisManager.prototype = {
        placesService: null,
        map: null,
        user: null,
        game: null,

        markers: [],

        lastAddPoisPosition: null,

        // Is the loading icon spinning.
        loadingShown: false,

        // @type {google.maps.InfoWindow}
        infoWindow: null,

        // Maps our own POI to actions.
        typeActions: {},

        // Maps POIs types to our own types.
        poiTypes: {},

        // Bypass for addNearbyPois.
        getNearbyPois: function(ev) {

            var userPosition = this.user.marker.getPosition();

            // We want to compare how far the destination is comparing with the last position where we added points of interest.
            // This process is not ideal, imagine a user walking in circles, we will always look for new POIs but
            // it would not be needed, as we already added them.
            // TODO This could be improved by storing a list of all reached positions and compare distances
            // between position var and each of them.
            var distance;
            if (this.lastAddPoisPosition) {
                distance = google.maps.geometry.spherical.computeDistanceBetween(this.lastAddPoisPosition, userPosition).toFixed();
                console.log('Moved ' + distance + ' meters to ' + userPosition.toString() + '.');
            } else {
                // More than Const.poisRadius for sure.
                distance = 1000000;
            }

            // Add new POIs if the current position and the previous one are far enough.
            // Better to update it more frequently than what we should strictly do.
            if (distance > Const.poisRadius / 2) {
                this.addNearbyPois(userPosition);
                this.lastAddPoisPosition = userPosition;
            }

        },

        addNearbyPois: function(position) {

            this.lastAddPoisPosition = this.user.marker.getPosition();

            this.showLoading();

            for (var i in this.searchGroups) {
                this.placesService.nearbySearch({
                    location: position,
                    radius: Const.poisRadius,
                    types: this.searchGroups[i],
                }, this.addPois.bind(this));
            }
        },

        addPois: function(results, status) {

            if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                this.hideLoading();
                return;
            } else if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error('PlacesService error: ' + status);
                return;
            }

            // A marker for each result.
            for (var i = 0; i < results.length; i++) {
                this.addMarker(results[i]);
            }

            // Once one of the calls is done (see this.addNearbyPois) we hide the loading.
            this.hideLoading();
        },

        addMarker: function(data) {

            // Check that it is not already on the map.
            if (typeof this.markers[data.place_id] !== "undefined") {
                return;
            }

            var marker = new google.maps.Marker({
                map: this.map,
                position: data.geometry.location,
                icon: Icon.get(data.types, this.poiTypes, 0.5),
                zIndex: 1
            });
            this.markers[data.place_id] = {
                marker: marker
            };

            // Click listener.
            marker.addListener('click', function(e) {
                this.user.moveTo(e.latLng, enableButtons);
                this.showPlaceDetails(data, marker);
            }.bind(this));
        },

        showPlaceDetails: function(data, marker) {

            var request = {placeId: data.place_id};

            // Ok, I don't like this, but I don't want 30 bind(this).
            var self = this;

            this.placesService.getDetails(request, function(place, status) {

                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    console.error('PlacesService error: ' + status);
                    return;
                }

                // Get the first valid place type and get the valid actions for that type.
                var actions = self.getActions(place.types, place, marker);

                var size = Util.getImageSize();
                var content = '<h3>' + data.name + '</h3>' +
                    '<img class="poi-img" src="' + External.getStreetViewImage(data.vicinity, size.width, size.height) + '"' +
                        ' width="' + size.width + '" height="' + size.height + '"/>';

                // Does the user own the place?
                var owned = false;
                if (self.user.getProperties()[data.place_id]) {
                    owned = true;
                }

                if (actions.length > 0) {
                    content = content + '<div class="action-buttons">';
                    for(var i = 0; i < actions.length; i++) {

                        // Only some actions are available once the property was bought.
                        // In future there might be actions available only once the property is bought.
                        if (!owned || propertyActions.indexOf(actions[i].constructor.name) !== -1) {
                            var id = 'id-action-' + i;
                            var buttonClass = 'start-action btn ' + UI.getActionButtonStyle(i);
                            content = content + '<button id="' + id + '" class="' + buttonClass + '" disabled="disabled">' +
                                actions[i].getVisibleName() + '</button>';
                        }
                    }
                    content = content + '</div>';
                }

                InfoWindow.open({
                    map: self.map,
                    marker: marker,
                    content: content,
                    infoWindow: self.infoWindow,
                });

                // Clear remaining listeners as we don't want them queued.
                google.maps.event.clearListeners(self.infoWindow, 'domready');
                google.maps.event.addListener(self.infoWindow, 'domready', function() {
                    // On click we render the selected action.
                    $('.start-action').click(function(ev) {
                        ev.preventDefault();

                        self.infoWindow.close();

                        // Get the selected action.
                        var action = actions[ev.target.id.substr(10)];

                        // Get whether the action is text based or a game.
                        var actionType = action.getActionType();

                        if (actionType === "game-action") {
                            action.start();

                        } else if (actionType === "text-action") {
                            // Render the selected action.

                            self.showLoading();

                            // Actions may include async calls.
                            promise = action.render();
                            promise.done(function(html) {

                                if (!html) {
                                    $('#text-action').modal('hide');
                                    return;
                                }

                                // Promises returned by action's render methods should just return an HTML string.
                                document.getElementById('text-action-content').innerHTML = html;

                                // Notify the action that html has been rendered.
                                if (typeof action.rendered === 'function') {
                                    action.rendered();
                                }
                            });
                        }
                    });
                });
            });

        },

        /**
         * List of the places we are interested on.
         */
        getTypesList: function() {
            var list = [];
            $.each(this.poiTypes, function(index, object) {
                list.push(index);
            });
            return list;
        },

        getActions: function(placeTypes, poiData, marker) {

            // Picking the first valid one.
            var poiType = null;
            for(var i = 0; i < placeTypes.length; i++) {
                if (this.poiTypes.hasOwnProperty(placeTypes[i])) {
                    poiType = this.poiTypes[placeTypes[i]];
                    break;
                }
            }

            if (poiType === null || typeof this.typeActions[poiType] === "undefined") {
                console.error('No place type found for placetypes ' + placeTypes.join(','));
                return [];
            }

            // We create the instances here.
            var instances = [];
            for(var i = 0; i < this.typeActions[poiType].length; i++) {
                var action = new this.typeActions[poiType][i](this.user, this.game, marker, poiData);
                instances.push(action);
            }
            return instances;
        },

        showLoading: function() {
            if ($('#text-action').data('bs.modal').isShown === false) {

                document.getElementById('text-action-content').innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
                $('#text-action').modal('show');

                this.loadingShown = true;
            }
        },

        hideLoading: function() {
            if (this.loadingShown) {

                $('#text-action').modal('hide');

                this.loadingShown = false;
            }
        }

    };

    return PoisManager;
});
