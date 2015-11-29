define(['bs', 'External', 'Icon', 'InfoWindow', 'story/PerthUnderground', 'story/ModernAlchemist'], function($, External, Icon, InfoWindow, StoryPerthUnderground, StoryModernAlchemist) {

    // This contains the game instructions, they are attached to the first steps of the game.
    var instructions = [
        'Find your next destination looking at the map, zoom out if you can\'t see any specially big marker',
        'You can use <i class="fa fa-eye"></i> button to see nearby places, you can visit them to recover yourself or to get money',
        'Note that you can see your energy <i style="color: #8397D2;" class="fa fa-cutlery"></i> in the top left screen corner, it decreases over time, if it reaches 0 your life will start decreasing, you can recover ryouself eating',
    ];

    function StoryManager(placesService, map, game, user) {
        this.map = map;
        this.game = game;
        this.user = user;
        this.placesService = placesService;

        // TODO Hardcoded as this is supposed to cover all StoryStep API.
        //this.story = new StoryModernAlchemist(this.user, this.game);
        this.story = new StoryPerthUnderground(this.user, this.game);

        // Show intro text, attaching start up instructions.
        var content = '<h1 class="story-name">' + this.story.title + '</h1>' +
            '<p>' + this.story.getIntro() + '</p>' +
            '<img src="' + this.user.photo + '" class="step-img img-responsive img-circle"/>' +
            this.getTip(0);

        $('#text-action-content').html(content);
        $('#text-action').modal('show');

        // Set the story initial position.
        this.user.setInitialPosition(this.story.initialPosition);
        this.map.setCenter(this.story.initialPosition);

        this.map.setZoom(this.story.zoom);

        this.setStepLocation(this.story.getNextStep());

        return this;
    }

    StoryManager.prototype = {

        map: null,
        game: null,
        user: null,
        placesService: null,

        story: null,

        stepsGarbage: [],

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

            // Click listener.
            marker.addListener('click', function(e) {

                this.user.moveTo(e.latLng, function(position) {

                    // Clean previous steps garbage.
                    this.cleanGarbage();

                    // We show info if required, this might be pre-completed info, post-completed info or any
                    // info during the step process.
                    var contents = step.getInfo();
                    if (contents) {
                        this.openInfoWindow(marker, step, contents);
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
                            this.stepsGarbage.push(marker);
                        }
                    }
                }.bind(this));
            }.bind(this));
        },

        cleanGarbage: function() {
            for (var i in this.stepsGarbage) {
                // TODO We might want to clean step data too if garbage remains there.
                this.stepsGarbage[i].setMap(null);
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

        openInfoWindow: function(marker, step, contents) {
            var content = '<h3>' + step.name + '</h3>' +
                '<div class="infowindow-content">' + contents;

            // Add a tip if there is one.
            var tip = this.getTip();
            if (tip) {
                content = content + tip;
            }

            content = content + '</div>';

            // Add some wikipedia info if available.
            //var promise = External.getWikipediaInfo(step.name);
            //promise.done(function(article) {
            //    step.infoWindow.setContent(infoWindow.getContent() + '<br/>' + article);
            //});

            // Initialise it if required.
            if (!step.infoWindow) {
                step.infoWindow = InfoWindow.getInstance();
            }
            InfoWindow.open({
                map: this.map,
                marker: marker,
                content: content,
                infoWindow: step.infoWindow,
            });
        },

        getTip: function(index) {

            if (typeof index === "undefined") {
                // +1 because we displayed the first tip (index 0) in the intro.
                index = this.story.currentStep + 1;
            }

            if (typeof instructions[index] === "undefined") {
                return '';
            }
            return '<div class="game-tip">(' + instructions[index] + ')</div>';
        }
    };

    return StoryManager;
});
