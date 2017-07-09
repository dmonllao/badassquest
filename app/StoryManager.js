define(['bs', 'Const', 'UI', 'Map', 'InfoWindow', 'MissionsChain', 'story/Free', 'story/PerthUnderground', 'story/ForPresident'], function($, Const, UI, Map, InfoWindow, MissionsChain, StoryFree, StoryPerthUnderground, StoryForPresident) {

    // This contains the game instructions, ordered by how important they are to understand how the game works.
    var instructions = [
        'Gain experience and reputation by being a badass <img src="CHARACTERPIC" class="img-circle notification-img">.',
        'Control city areas <i class="fa fa-flag" style="color: #95c355;"></i> by extorting businessmen or buying places <i class="fa fa-home" style="color: #95c355;"></i>.',
        'Click on the map <i class="fa fa-mouse-pointer"></i> or on markers <i class="fa fa-hand-pointer-o"></i> to move around the city.',
        'Zoom out <i class="fa fa-fw fa-minus"></i> to see more nearby places <i class="fa fa-map-marker" style="color: #e15c5c"></i>. You can change the map view by pressing <i class="fa fa-fw fa-map-o"></i>.',
        'Eat regularly <i class="fa fa-cutlery" style="color: grey;"></i> or your life <i class="fa fa-heart" style="color: #e15c5c;"></i> will start decreasing.',
        'Your progress is automatically saved <i class="fa fa-save" style="color: grey;"></i> every few seconds.'
    ];

    var initPromise = $.Deferred();

    function StoryManager(map, game, user) {
        this.map = map;
        this.game = game;
        this.user = user;
        this.infoPersonWindow = InfoWindow.getInstance();

        // TODO Hardcoded as this is supposed to cover all Mission API.
        //this.story = new StoryModernAlchemist(this.user, this.game);
        //this.story = new StoryPerthUnderground(this.user, this.game);
        //this.story = new StoryFree(this.user, this.game);
        this.story = new StoryForPresident(this.user, this.game);

        var resumeGame = localStorage.getItem('userPosition');

        if (resumeGame) {
            var content = '<h1 class="story-name">' + this.story.getTitle() + '</h1>' + UI.renderActionButtons([
                {
                    id: 'resume',
                    text: 'Resume'
                }, {
                    id: 'reset',
                    text: 'New game'
                }
            ], 'continue-buttons') + UI.getIntroFooter();
        } else {
            // Show intro text.

            var content = '<h1 class="story-name">' + this.story.getTitle() + '</h1>' +
                '<div class="story-intro">' + this.story.getIntro() + '</div>' +
                '<div class="row user-pic-selector">' +
                    '<div class="col-xs-6"><img title="I am what I am" id="trump-pic" alt="Donald Trump" src="img/trump.png" class="player-photo img-responsive img-circle"/></div>' +
                    '<div class="col-xs-6"><img title="Antes de morir prefiero la muerte" id="ramos-pic" alt="Sergio Ramos" src="img/ramos.png" class="other-players-photo img-responsive img-circle"/></div>' +
                '</div>' +
                UI.renderActionButtons([{
                    id: 'newgame',
                    text: '<i class="fa fa-gamepad"></i> Play'
                }]) +
                UI.getIntroFooter();
        }
        UI.showModal(content);

        $('#newgame').on('click', function() {
            var placeinput = $('#place-input');
            placeinput.focus();
            placeinput.popover({
                content: 'Select a city first',
                placement: 'bottom'
            });
            placeinput.popover('show');
        });
        $('#resume').on('click', function() {
            $('#text-action').modal('hide');
        });
        $('#reset').on('click', function() {
            this.user.clearGame();
            location.reload();
        }.bind(this));
        $('#share').on('click', function(shareEv) {
            shareEv.preventDefault();

            UI.showShare();
        });

        // Change player pic.
        $('#ramos-pic').on('click', function(ev) {
            this.user.updatePhoto(ev.currentTarget.src);
            $('#ramos-pic').addClass('player-photo');
            $('#ramos-pic').removeClass('other-players-photo');
            $('#trump-pic').removeClass('player-photo');
            $('#trump-pic').addClass('other-players-photo');
        }.bind(this));
        $('#trump-pic').on('click', function(ev) {
            this.user.updatePhoto(ev.currentTarget.src);
            $('#trump-pic').addClass('player-photo');
            $('#trump-pic').removeClass('other-players-photo');
            $('#ramos-pic').removeClass('player-photo');
            $('#ramos-pic').addClass('other-players-photo');
        }.bind(this));

        // Set the story initial position.
        this.map.setZoom(this.story.zoom);
        if (resumeGame) {
            var coords = JSON.parse(resumeGame);
            this.setPosition(new google.maps.LatLng(coords), false);
        } else if (this.story.initialPosition) {
            this.setPosition(new google.maps.LatLng(this.story.initialPosition));
        } else {
            // Set a nice background while the user selects a position.
            this.map.setCenter(Const.defaultMapCenterBackground);
            this.user.setPosition(Const.defaultMapCenterBackground);
            this.story.getPosition(this.map, initPromise, function(locationCoords, locationName) {
                // Callback once a location is selected.

                $('#newgame').on('click', function() {
                    this.setPosition(locationCoords);
                    $('#text-action').modal('hide');
                }.bind(this));
                $('#newgame').removeAttr("disabled");
            }.bind(this));
        }

        if (this.story.missions.length > 0) {
            // TODO Story missions state should be saved.
            var missionsChain = new MissionsChain(this.map, this.game, this.user,
                this.story.missions, this.gameCompleted.bind(this));
            missionsChain.setMissionLocation();
        }

        // Allow stories to execute extra stuff.
        if (typeof this.story.ready !== "undefined") {
            this.story.ready();
        }

        return this;
    }

    StoryManager.prototype = {

        map: null,
        game: null,
        user: null,

        story: null,

        infoPersonWindow: null,

        /**
         * Returns the initialisation promise.
         *
         * It might be already resolved if the story sets a fixed initial
         * position, otherwise we need to wait until we get user input.
         */
        init: function() {
            return initPromise;
        },

        /**
         * Sets the inital game position. This is when the game really starts.
         * @param {google.maps.LatLng} LatLng, would not work using {lat:, lng}.
         */
        setPosition: function(position, showTips) {

            if (typeof showTips === 'undefined') {
                showTips = true;
            }

            // Set the user position and center there the map.
            this.user.setPosition(position);
            this.map.setCenter(position);
            this.map.getStreetView().setPosition(position);

            google.maps.event.addListenerOnce(this.map, 'idle', function() {
                // After zoom and center is set.
                var text = 'Hey! You look exactly like my dead son! Are you new in the city? I should adopt you, keep my phone number, I will contact you.';
                this.addInfoPerson(position, text, function() {
                    $('#map').trigger('notification:add', {
                        from: '<img src="img/chuck.jpg" class="img-circle notification-img"> Chuck Norris',
                        message: 'Explore the city for a while, I hope you survive... catch you later amigou',
                    });
                });
            }.bind(this));

            if (showTips) {
                this.addGameTips();
            }

            // Let other components know that we already have the position.
            initPromise.resolve(position);
        },

        addInfoPerson: function(userPosition, message, callback) {

            // The info guy should appear close enough to the user and inside the map bounds.
            var bounds = this.map.getBounds();

            // Reducing the distance as the the corner is out of the map. It does not matter if chuck is not in
            // a road, the user will get that they should click there
            var distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(userPosition, bounds.getNorthEast()).toFixed() * 0.5);
            var chuckPosition = google.maps.geometry.spherical.computeOffset(userPosition, distance, 45);

            var html = '<img class="big-centered-img img-responsive img-circle" src="img/chuck.jpg"/><div>' + message + '</div>';
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
                zIndex: 7,
                optimized: false,
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);

            var self = this;
            marker.addListener('click', function() {
                self.user.moveTo(marker.getPosition(), function() {

                    // Clickable just once.
                    google.maps.event.clearInstanceListeners(marker);
                    marker.setClickable(false);

                    // Show info, stop animation and remove the marker after
                    // 10 secs, considering 10 secs enough for the user to see the message.
                    self.openInfo(marker, name, html, self.infoPersonWindow);
                    marker.setAnimation(null);
                    setTimeout(function() {
                        self.infoPersonWindow.setMap(null);
                        marker.setMap(null);
                        marker = null;
                        if (typeof callback !== "undefined") {
                            callback();
                        }
                    }, 10000);
                });
            });
        },

        /**
         * Copied from the MissionsChain.openInfoWindow one, but better to keep them separated
         * we might want to change all the styling.
         */
        openInfo: function(marker, name, contents, infoWindow) {

            // Initialise it if required.
            if (!infoWindow) {
                infoWindow = InfoWindow.getInstance();
            }

            var content = '<h3>' + name + '</h3>' +
                '<div class="infowindow-content">' + contents + '</div>';

            InfoWindow.open({
                map: this.map,
                marker: marker,
                content: content,
                infoWindow: infoWindow,
            });

            return infoWindow;
        },

        addGameTips: function() {

            var lastInstruction = 0;
            setTimeout(function() {

                // [0] contains the character image, we need to replace the placeholder.
                instructions[0] = instructions[0].replace('CHARACTERPIC', this.user.photo);
                var content = '<h1>How to play</h1>' +
                    '<p id="instruction">' + instructions[0] + '</p>';

                var nextButton = {
                    id: 'next',
                    text: '<i class="fa fa-arrow-right"></i> Next'
                };
                var skipButton = {
                    id: 'skip',
                    text: 'Skip'
                };
                var buttons = UI.renderActionButtons([nextButton, skipButton]);
                UI.showModal(content + buttons);

                $('#skip').on('click', function(ev) {
                    $('#text-action').modal('hide');
                });

                $('#next').on('click', function(ev) {
                    if (lastInstruction + 2 === instructions.length) {
                        // Update button text (we keep skip because it already has the
                        // close modal listener attached.
                        $('#text-action #skip').addClass('btn-success');
                        $('#text-action #skip').removeClass('btn-danger');
                        $('#text-action #skip').html('<i class="fa fa-gamepad"></i> Play');
                        $('#text-action #skip').focus();
                        $('#text-action #next').remove();
                    }

                    $('#instruction').html(instructions[lastInstruction + 1]);
                    lastInstruction++;
                });
            }.bind(this), 2000);
        },

        gameCompleted: function() {
            // Game completed.
            $('#status-title').html('The end');
            $('#status-content').html(this.story.getTheEnd());
            $('#status').modal('show');
        }
    };

    return StoryManager;
});
