define(['bs', 'Const', 'External', 'Icon', 'InfoWindow', 'story/Free'], function($, Const, External, Icon, InfoWindow, StoryFree) {

    // This contains the game instructions, they are attached to the first steps of the game.
    var instructions = [
        'Zoom out to see more points of interest',
        'You can see your energy <i style="color: #8397D2;" class="fa fa-cutlery"></i> in the top left screen corner, it decreases over time, don\'t starve'
    ];

    var initPromise = $.Deferred();

    function StoryManager(placesService, map, game, user) {
        this.map = map;
        this.game = game;
        this.user = user;
        this.placesService = placesService;
        this.infoPersonWindow = InfoWindow.getInstance();

        // TODO Hardcoded as this is supposed to cover all StoryStep API.
        //this.story = new StoryModernAlchemist(this.user, this.game);
        //this.story = new StoryPerthUnderground(this.user, this.game);
        this.story = new StoryFree(this.user, this.game);

        // Show intro text, attaching start up instructions.
        var content = '<h1 class="story-name">' + this.story.title + '</h1>' +
            '<div class="story-intro">' + this.story.getIntro() + '</div>' +
            '<img src="' + this.user.photo + '" class="step-img img-responsive img-circle"/>';

        $('#text-action-content').html(content);
        $('#text-action').modal('show');

        // Set the story initial position.
        this.map.setZoom(this.story.zoom);
        if (this.story.initialPosition) {
            this.setPosition(this.story.initialPosition);
        } else {
            // Set a nice background while the user selects a position.
            this.map.setCenter(Const.defaultMapCenterBackground);
            this.story.getPosition(this.map, initPromise, this.setPosition.bind(this));
        }

        if (this.story.steps.length > 0) {
            this.setStepLocation(this.story.getNextStep());
        }

        return this;
    }

    StoryManager.prototype = {

        map: null,
        game: null,
        user: null,
        placesService: null,

        story: null,

        markersGarbage: [],

        infoPersonWindow: null,

        init: function() {

            // Delegate to the story if it has any specific action to perform.
            this.story.init();

            return initPromise;
        },

        setPosition: function(position) {

            // Set the user position and center there the map.
            this.user.setInitialPosition(position);
            this.map.setCenter(position);

            // After zoom and center is set.
            var text = 'Hey, first time I see you around, welcome! Explore the city but take care, there is some dodgy people here.';
            this.addInfoPerson(position, text);

            // Let other components know that we already have the position.
            initPromise.resolve(position);
        },

        addInfoPerson: function(userPosition, message) {

            // The info guy should appear close enough to the user and inside the map bounds.
            var bounds = this.map.getBounds();

            // Reducing the distance as the the corner is out of the map. It does not matter if chuck is not in
            // a road, the user will get that they should click there
            var distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(userPosition, bounds.getNorthEast()).toFixed() * 0.5);
            var chuckPosition = google.maps.geometry.spherical.computeOffset(userPosition, distance, 45);

            var html = '<div>' + message + '</div><img class="step-img img-responsive img-circle" src="img/chuck.jpg"/>';
            // Chuck Norris will give you some info.
            var name = 'Chuck Norris';
            var marker = new google.maps.Marker({
                map: this.map,
                title: name,
                position: chuckPosition,
                icon: {
                    url: 'img/chuck.jpg',
                    scaledSize: new google.maps.Size(40, 40),
                },
                zIndex: 7
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.addListener('click', function() {
                this.user.moveTo(marker.getPosition(), function() {
                    // Show info, stop animation and remove the marker after 10 secs.
                    this.openInfoWindow(marker, name, html, this.infoPersonWindow);
                    marker.setAnimation(null);
                    this.markersGarbage.push(marker);
                    setTimeout(function() {
                        this.cleanGarbage();
                        this.infoPersonWindow.setMap(null);
                    }.bind(this), 10000);
                }.bind(this));
            }.bind(this));
        },

        setStepLocation: function(step) {

            // Placeid is not required.
            if (step.placeid) {
                var request = {placeId: step.placeid};
                this.placesService.getDetails(request, function(placeData, status) {

                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        console.error('PlacesService error: ' + status);
                        return;
                    }

                    this.addStepLocation(step, placeData);
                }.bind(this));

            } else {
                this.addStepLocation(step);
            }
        },

        addStepLocation: function(step, placeData) {

            if (typeof placeData === "undefined") {
                placeData = {
                    fakePlace: true,
                    icon: Icon.getByType('idea'),
                    name: 'You arrived'
                };
            }

            // Fallback to the poi marker.
            if (step.icon === null) {
                // Fallback again to the default icon.
                step.icon = placeData.icon;
                if (placeData.fakePlace) {
                    console.error('If the step does not have a placeid you should specify a step icon');
                }
            }

            // Fallback to the poi name.
            if (step.name === null) {
                step.name = placeData.name;
                if (placeData.fakePlace) {
                    console.error('If the step does not have a placeid you should specify a step name');
                }
            }

            // Fallback to the poi position.
            if (step.position === null) {
                if (placeData.fakePlace) {
                    // Here we return because this is a required param, we can not have a generic one.
                    console.error('If the step does not have a placeid you should specify a step position');
                    return;
                }
                step.position = placeData.geometry.location;
            }

            // To execute it after the step is completed.
            step.setCompletedCallback(this.stepCompleted.bind(this));

            var marker = new google.maps.Marker({
                map: this.map,
                title: step.name,
                position: step.position,
                icon: step.icon,
                zIndex: 7
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);

            // Steps may specify hints.
            if (step.hint) {
                this.addStepHint(step);
            }

            // Add a game tip if there is one.
            this.addGameTip();

            // Click listener.
            marker.addListener('click', function(e) {

                this.user.moveTo(e.latLng, function(position) {

                    // Clean previous steps garbage.
                    this.cleanGarbage();

                    // We show info if required, this might be pre-completed info, post-completed info or any
                    // info during the step process.
                    var contents = step.getInfo();
                    if (contents) {
                        this.openInfoWindow(marker, step.name, contents, step.infoWindow);
                    }

                    // It only makes sense when the step is uncompleted, the step must control what should be shown
                    // depending on its internal status.
                    if (!step.isCompleted()) {
                        step.execute();
                    }

                    if (step.isCompleted()) {
                        marker.setAnimation(null);

                        // The step can decide whether the marker is removed or not.
                        if (step.cleanIt()) {
                            // We will clean it after next point is reached as otherwise we would
                            // have to deal with onClose infoWindow.
                            this.markersGarbage.push(marker);
                        }
                    }
                }.bind(this));
            }.bind(this));
        },

        cleanGarbage: function() {
            for (var i in this.markersGarbage) {
                // TODO We might want to clean step data too if garbage remains there.
                this.markersGarbage[i].setMap(null);
            }
        },

        stepCompleted: function() {

            var nextStep = this.story.getNextStep();
            if (nextStep) {
                // Reveal next step.
                // TODO Play sound.
                this.setStepLocation(nextStep);
            } else {
                // Game completed.
                $('#status-title').html('The end');
                $('#status-content').html(this.story.getTheEnd());
                $('#status').modal('show');
            }
        },

        openInfoWindow: function(marker, name, contents, infoWindow) {

            // Initialise it if required.
            if (!infoWindow) {
                infoWindow = InfoWindow.getInstance();
            }

            var content = '<h3>' + name + '</h3>' +
                '<div class="infowindow-content">' + contents + '</div>';

            // Add some wikipedia info if available.
            //var promise = External.getWikipediaInfo(step.name);
            //promise.done(function(article) {
                //content += '<br/>' + article;
            //}).always(function() {
                InfoWindow.open({
                    map: this.map,
                    marker: marker,
                    content: content,
                    infoWindow: infoWindow,
                });
            //}.bind(this));

            return infoWindow;
        },

        addStepHint: function(step) {
            // Bit of timeout to make it look real.
            setTimeout(function() {
                $('#map').trigger('notification:add', {
                    from: step.hint.from,
                    message: step.hint.message,
                    callback: function() {
                        if (this.map.getCenter().distanceFrom(step.position) > 300) {
                            // Show both current location and next step.
                            var bounds = new google.maps.LatLngBounds(this.map.getCenter().toJSON(), step.position.toJSON());
                            this.map.fitBounds(bounds);
                        } else {
                            this.map.panTo(step.position);
                        }
                    }.bind(this)
                });
            }.bind(this), 500);
        },

        addGameTip: function() {

            index = this.story.currentStep;

            if (typeof instructions[index] === "undefined") {
                return;
            }

            // Bit of timeout to make it look real.
            setTimeout(function() {
                $('#map').trigger('notification:add', {
                    from: 'Game tip',
                    message: instructions[index]
                });
            }, 1000);
        }
    };

    return StoryManager;
});
