define(['bs', 'Util', 'Game', 'action/Cure', 'action/Food', 'action/Steal', 'action/Fight', 'External', 'Icon'], function($, Util, Game, ActionCure, ActionFood, ActionSteal, ActionFight, External, Icon) {

    var enableButtons = function(position) {
        $('.start-action').attr('disabled', false);
    };

    var getActionButtonStyle = function(index) {
        var styles = ['btn-success', 'btn-warning', 'btn-primary', 'btn-info', 'btn-danger'];
        if (typeof styles[index] !== "undefined") {
            return styles[index];
        }
        // Mod otherwise.
        return styles[index % styles.length];
    };

    function PoisManager(placesService, appMap, user) {
        this.placesService = placesService;
        this.map = appMap;
        this.user = user;

        // Now that google.maps is available.
        this.infoWindow = new google.maps.InfoWindow();

        this.typeActions = {
            health: [ActionCure],
            shop: [ActionSteal],
            wealth: [ActionSteal, ActionFight],
            food: [ActionFood],
        };

        this.poiTypes = {
            hospital: 'health',
            doctor: 'health',
            shopping_mall: 'shop',
            bank: 'wealth',
            atm: 'wealth',
            restaurant: 'food',
            bar: 'food'
        };

        // Start the game.
        var appGame = new Game();
        this.game = appGame.getInstance();

        $('#game-action').on('hidden.bs.modal', function (e) {

            // Cleanup the current state.
            var state = this.game.state.getCurrentState();
            state.finishFight();

            // Move to the empty one.
            this.game.state.start('Empty');
        }.bind(this));

        $('#map').on('pois:get', this.getNearbyPois.bind(this));
    }

    PoisManager.prototype = {
        placesService: null,
        map: null,
        user: null,
        game: null,

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
            this.addNearbyPois(this.user.marker.getPosition());
        },

        addNearbyPois: function(position) {

            this.showLoading();

            this.placesService.nearbySearch({
                location: position,
                radius: 300,
                types: this.getTypesList()
            }, this.addPois.bind(this));
        },

        addPois: function(results, status) {

            if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                $('#radar').popover({
                    content: 'No results',
                    delay: {show: 1000, hide: 1000},
                    placement: 'left',
                    trigger: 'manual'
                });
                $('#radar').popover('show');
                setTimeout(function() {
                    $('#radar').popover('destroy');
                }, 5000);

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

            // Once done hide the spinning icon.
            this.hideLoading();
        },

        addMarker: function(data) {

            var marker = new google.maps.Marker({
                map: this.map,
                position: data.geometry.location,
                icon: Icon.get(data.types, this.poiTypes),
                zIndex: 1
            });

            // Click listener.
            marker.addListener('click', function(e) {

                this.user.moveTo(e.latLng, enableButtons);

                var request = {placeId: data.place_id};
                this.placesService.getDetails(request, function(place, status) {
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        console.error('PlacesService error: ' + status);
                    } else {

                        // Get the first valid place type and get the valid actions for that type.
                        var actions = this.getActions(place.types, place, marker);

                        var size = Util.getImageSize();
                        var content = '<div class="infowindow-content">' +
                            '<h3>' + data.name + '</h3>' +
                            '<img src="' + External.getStreetViewImage(data.vicinity, size.width, size.height) + '" width="' + size.width + '" height="' + size.height + '"/>';

                        if (actions.length > 0) {
                            content = content + '<div class="action-buttons">';
                            for(var i = 0; i < actions.length; i++) {
                                var id = 'id-action-' + i;
                                var buttonClass = 'start-action btn ' + getActionButtonStyle(i);
                                content = content + '<button id="' + id + '" class="' + buttonClass + '" disabled="disabled">' + actions[i].getVisibleName() + '</button>';
                            }
                            content = content + '</div>';
                        }

                        content = content + '</div>';

                        this.infoWindow.setContent(content);
                        this.infoWindow.open(this.map, marker);

                        // On click we render the selected action.
                        $('.start-action').click(function(ev) {

                            this.infoWindow.close();

                            // Get the selected action.
                            var action = actions[ev.target.id.substr(10)];

                            // Get whether the action is text based or a game.
                            var actionType = action.getActionType();

                            if (actionType === "game-action") {

                                var gamePromise = action.setState();
                                gamePromise.done(function(stateName) {

                                    // Start the selected state passing the action arguments.
                                    this.game.state.start(stateName, true, false, action);

                                    $('#game-action').modal('show');

                                }.bind(this));

                            } else if (actionType === "text-action") {
                                // Render the selected action.

                                this.showLoading();

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
                                }.bind(this));
                            }
                        }.bind(this));
                    }
                }.bind(this));
            }.bind(this));

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
