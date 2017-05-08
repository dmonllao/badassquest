define(['bs', 'Sound'], function($, Sound) {

    var user = null;
    var panorama = null;

    function Controls() {
        return this;
    }

    Controls.prototype = {

        controls: {},

        init: function(userObj) {

            user = userObj;

            this.controls[google.maps.ControlPosition.LEFT_TOP] = [];
            this.controls[google.maps.ControlPosition.RIGHT_TOP] = [];
            this.controls[google.maps.ControlPosition.RIGHT_BOTTOM] = [];
            this.controls[google.maps.ControlPosition.RIGHT_CENTER] = [];
            this.controls[google.maps.ControlPosition.LEFT_BOTTOM] = [];
            this.controls[google.maps.ControlPosition.BOTTOM_RIGHT] = [];
            this.controls[google.maps.ControlPosition.TOP_CENTER] = [];

            this.initHealth(user.state, user.attrs);
            this.initFood(user.state, user.attrs);
            this.initWealth(user.state, user.attrs);
            this.initLevel(user.state, user.attrs);
            this.initAchievements();

            this.initZoom();
            this.initMapView();
            this.initSound();
            this.initNotifications();


            // My default to the hybrid view.
            this.setControls(user.map);
        },

        update: function(state, attrs) {
            $('#health pre span').html(this.round(state.cHealth) + ' / ' + this.round(attrs.tHealth));
            $('#wealth pre span').html(this.round(state.cWealth));
            $('#food pre span').html(this.round(state.cFood) + ' / ' + this.round(attrs.tFood));
            $('#level pre span').html('Level ' + this.round(state.level));
        },

        updateNotifications: function(num) {

            var current = $('#notifications-num');
            if (current.length > 0 && num === 0) {
                current.remove();
            } else if (current.length > 0 && current.text() != String(num)) {
                current.text(num);
            } else if (current.length === 0 && num !== 0) {
                $('#notifications pre').append('<span id="notifications-num" class="badge">' + num + '</span>');
            }

        },

        round: function(value) {
            return Math.ceil(value);
        },

        initHealth: function(state, attrs) {
            var healthDiv = document.createElement('div');
            healthDiv.setAttribute('id', 'health');
            healthDiv.setAttribute('class', 'control-wrapper');
            healthDiv.innerHTML = '<pre title="Health" class="control state"><i style="color: #e15c5c;" class="fa fa-heart"></i><span>' + this.round(state.cHealth) + ' / ' + this.round(attrs.tHealth) + '</span></pre>';

            this.controls[google.maps.ControlPosition.TOP_CENTER].push(healthDiv);
        },

        initFood: function(state, attrs) {
            var foodDiv = document.createElement('div');
            foodDiv.setAttribute('id', 'food');
            foodDiv.setAttribute('class', 'control-wrapper');
            foodDiv.innerHTML = '<pre title="Energy" class="control state"><i style="color: #8397D2;" class="fa fa-cutlery"></i><span>' + this.round(state.cFood) + ' / ' + this.round(attrs.tFood) + '</span></pre>';
            this.controls[google.maps.ControlPosition.TOP_CENTER].push(foodDiv);
        },

        initWealth: function(state, attrs) {
            var wealthDiv = document.createElement('div');
            wealthDiv.setAttribute('id', 'wealth');
            wealthDiv.setAttribute('class', 'control-wrapper');
            wealthDiv.innerHTML = '<pre title="Cash" class="control state"><i style="color: green;" class="fa fa-usd"></i>' +
                '<span>' + this.round(state.cWealth) + '</span></pre>';
            this.controls[google.maps.ControlPosition.TOP_CENTER].push(wealthDiv);
        },

        initLevel: function(state, attrs) {
            var levelDiv = document.createElement('div');
            levelDiv.setAttribute('id', 'level');
            levelDiv.setAttribute('class', 'control-wrapper');
            levelDiv.innerHTML = '<pre title="Level" class="control state"><i style="color: #FFAF30;" class="fa fa-level-up">' +
                '</i><span id="level-text">Level ' + state.level + '</span></pre>';
            this.controls[google.maps.ControlPosition.TOP_CENTER].push(levelDiv);
        },

        initAchievements: function() {

            // Achievements.
            var achievementsDiv = document.createElement('div');
            achievementsDiv.setAttribute('id', 'achievements');
            achievementsDiv.setAttribute('class', 'control-wrapper');

            // Force left margin to 0 to overwrite control > span.
            achievementsDiv.innerHTML = '<pre class="control state actionable-control">' +
                '<i style="color: #FFCC00;" class="fa fa-fw fa-trophy"></i>' +
                '<span style="margin-left: 0"/></pre>';

            google.maps.event.addDomListener(achievementsDiv, 'click', function() {
                $('#achievements-text').modal('show');

                $('#achievements-text #ok').on('click', function(ev) {
                    $('#achievements-text').modal('hide');
                });
            });

            this.controls[google.maps.ControlPosition.TOP_CENTER].push(achievementsDiv);
        },

        initZoom: function() {

            var zoomDiv = document.createElement('div');
            zoomDiv.setAttribute('id', 'zoom');
            zoomDiv.setAttribute('class', 'zoom control-wrapper');

            var zoomPlus = document.createElement('pre');
            zoomPlus.setAttribute('title', 'Zoom in');
            zoomPlus.setAttribute('class', 'control-combo-top control vertical-right-control actionable-control');
            zoomPlus.innerHTML = '<i class="fa fa-fw fa-plus"></i>';
            zoomDiv.appendChild(zoomPlus);

            var zoomMinus = document.createElement('pre');
            zoomMinus.setAttribute('title', 'Zoom out');
            zoomMinus.setAttribute('class', 'control-combo-bottom control vertical-right-control actionable-control');
            zoomMinus.innerHTML = '<i class="fa fa-fw fa-minus"></i>';
            zoomDiv.appendChild(zoomMinus);

            google.maps.event.addDomListener(zoomPlus, 'click', function() {
                user.map.setZoom(user.map.getZoom() + 1);
            });

            google.maps.event.addDomListener(zoomMinus, 'click', function() {
                user.map.setZoom(user.map.getZoom() - 1);
            });

            this.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(zoomDiv);
        },

        initMapView: function() {
            var mapViewDiv = document.createElement('div');
            mapViewDiv.setAttribute('id', 'mapView');
            mapViewDiv.setAttribute('class', 'control-wrapper');

            var mapViewRoadHtml = '<i class="fa fa-fw fa-road"></i>';
            var mapViewStreetHtml = '<i class="fa fa-fw fa-street-view"></i>';
            var mapViewHybridHtml = '<i class="fa fa-fw fa-map"></i>';

            // Defaults.
            var mapView = 'roadmap';
            mapViewDiv.innerHTML = '<pre title="Change map view" class="control vertical-right-control actionable-control">' + mapViewHybridHtml + '</pre>';

            // Rotate between the 3 formats.
            google.maps.event.addDomListener(mapViewDiv, 'click', function() {

                if (panorama === null) {
                    panorama = user.map.getStreetView();
                }

                if (mapView === 'hybrid') {
                    // Set the panorama to the user position.

                    panorama.setPosition(user.marker.getPosition());
                    user.marker.setVisible(false);
                    panorama.setVisible(true);

                    // We need to refresh them. Apparently they get lost.
                    this.setControls(user.map.getStreetView());
                    mapView = 'street';
                    $('#mapView pre').html(mapViewRoadHtml);
                } else if (mapView === 'street') {
                    // Update the user position with the current panorama position.

                    user.marker.setPosition(panorama.getPosition());
                    user.marker.setVisible(true);
                    panorama.setVisible(false);

                    // We need to refresh them. Apparently they get lost.
                    this.setControls(user.map);
                    mapView = 'road';
                    user.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                    $('#mapView pre').html(mapViewHybridHtml);
                } else {
                    // This is from roadmap to hybrid.
                    mapView = 'hybrid';
                    user.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
                    $('#mapView pre').html(mapViewStreetHtml);
                }
            }.bind(this));

            this.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(mapViewDiv);
        },

        initSound: function() {

            Sound.init();

            var musicDiv = document.createElement('div');
            musicDiv.setAttribute('id', 'sound');
            musicDiv.setAttribute('class', 'control-wrapper');

            var musicOnHtml = '<i class="fa fa-fw fa-volume-up"></i>';
            var musicOffHtml = '<i class="fa fa-fw fa-volume-off"></i>';

            // Sound is enabled by default, so we initially show mute button.
            musicDiv.innerHTML = '<pre title="Message box" class="control vertical-left-control actionable-control">' + musicOffHtml + '</pre>';

            google.maps.event.addDomListener(musicDiv, 'click', function() {
                var soundOn = Sound.toggle();
                if (soundOn === true) {
                    $('#sound pre').html(musicOffHtml);
                } else {
                    $('#sound pre').html(musicOnHtml);
                }
            });

            this.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(musicDiv);
        },

        initNotifications: function() {
            var notificationsDiv = document.createElement('div');
            notificationsDiv.setAttribute('id', 'notifications');
            notificationsDiv.setAttribute('class', 'control-wrapper');
            notificationsDiv.innerHTML = '<pre class="control vertical-left-control actionable-control"><i class="fa fa-fw fa-envelope"></i></pre>';

            google.maps.event.addDomListener(notificationsDiv, 'click', function() {
                $('#map').trigger('notification:toggle');
            });

            this.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(notificationsDiv);
        },

        /**
         * Param name is map although it can be a {Map} or a {StreetViewPanorama}
         */
        setControls: function(mapRef) {

            // It is already structured by its position.
            for (var side in this.controls) {
                if (this.controls.hasOwnProperty(side)) {

                    // We need to clean them all first.
                    mapRef.controls[side].clear();

                    for (var i in this.controls[side]) {
                        mapRef.controls[side].push(this.controls[side][i]);
                    }
                }
            }
        }
    };

    return Controls;
});
