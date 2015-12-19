define(['bs'], function($) {

    var user = null;
    var panorama = null;

    function Controls() {
    }

    Controls.prototype = {

        init: function(userObj) {

            user = userObj;

            this.initHealth(user.state, user.attrs);
            this.initFood(user.state, user.attrs);
            this.initWealth(user.state, user.attrs);
            this.initLevel(user.state, user.attrs);

            this.initZoom();
            this.initCenter();
            this.initMapView();
            this.initNotifications();

            this.initStatics();
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
            } else if (current.length > 0 && current.text() != num) {
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
            healthDiv.innerHTML = '<pre class="control"><i style="color: red;" class="fa fa-heart"></i><span>' + this.round(state.cHealth) + ' / ' + this.round(attrs.tHealth) + '</span></pre>';
            user.map.controls[google.maps.ControlPosition.LEFT_TOP].push(healthDiv);
        },

        initFood: function(state, attrs) {
            var foodDiv = document.createElement('div');
            foodDiv.setAttribute('id', 'food');
            foodDiv.innerHTML = '<pre class="control"><i style="color: #8397D2;" class="fa fa-cutlery"></i><span>' + this.round(state.cFood) + ' / ' + this.round(attrs.tFood) + '</span></pre>';
            user.map.controls[google.maps.ControlPosition.LEFT_TOP].push(foodDiv);
        },

        initWealth: function(state, attrs) {
            var wealthDiv = document.createElement('div');
            wealthDiv.setAttribute('id', 'wealth');
            wealthDiv.innerHTML = '<pre class="control"><i style="color: green;" class="fa fa-usd"></i><span>' + this.round(state.cWealth) + '</span></pre>';
            user.map.controls[google.maps.ControlPosition.LEFT_TOP].push(wealthDiv);
        },

        initLevel: function(state, attrs) {
            var levelDiv = document.createElement('div');
            levelDiv.setAttribute('id', 'level');
            levelDiv.innerHTML = '<pre class="control"><i style="color: #FFCC00;" class="fa fa-trophy"></i><span id="level-text">Level ' + state.level + '</span></pre>';
            user.map.controls[google.maps.ControlPosition.LEFT_TOP].push(levelDiv);
        },

        initZoom: function() {

            var zoomDiv = document.createElement('div');
            zoomDiv.setAttribute('id', 'zoom');
            zoomDiv.setAttribute('class', 'zoom');

            var zoomPlus = document.createElement('pre');
            zoomPlus.setAttribute('class', 'control-combo-top control actionable-control');
            zoomPlus.innerHTML = '<i class="fa fa-fw fa-plus"></i>';
            zoomDiv.appendChild(zoomPlus);

            var zoomMinus = document.createElement('pre');
            zoomMinus.setAttribute('class', 'control-combo-bottom control actionable-control');
            zoomMinus.innerHTML = '<i class="fa fa-fw fa-minus"></i>';
            zoomDiv.appendChild(zoomMinus);

            google.maps.event.addDomListener(zoomPlus, 'click', function() {
                user.map.setZoom(user.map.getZoom() + 1);
            });

            google.maps.event.addDomListener(zoomMinus, 'click', function() {
                user.map.setZoom(user.map.getZoom() - 1);
            });

            user.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(zoomDiv);
        },

        initCenter: function() {
            var centerDiv = document.createElement('div');
            centerDiv.setAttribute('id', 'center');
            centerDiv.innerHTML = '<pre class="control actionable-control"><i class="fa fa-fw fa-arrows"></i></pre>';

            google.maps.event.addDomListener(centerDiv, 'click', function() {
                user.map.panTo(user.marker.getPosition());
            });

            user.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerDiv);
        },

        initMapView: function() {
            var mapViewDiv = document.createElement('div');
            mapViewDiv.setAttribute('id', 'mapView');

            var mapViewSatelliteHtml = '<i class="fa fa-fw fa-map"></i>';
            var mapViewStreetHtml = '<i class="fa fa-fw fa-street-view"></i>';
            var mapViewRoadHtml = '<i class="fa fa-fw fa-road"></i>';

            // Satellite by default.
            var mapView = 'satellite';
            mapViewDiv.innerHTML = '<pre class="control actionable-control">' + mapViewStreetHtml + '</pre>';

            // Rotate between the 3 formats.
            google.maps.event.addDomListener(mapViewDiv, 'click', function() {

                if (panorama === null) {
                    // Just once.
                    panorama = user.map.getStreetView();
                    panorama.addListener('visible_changed', function(visibility) {
                        if (panorama.getVisible() === false) {

                            // Update the user position with the current panorama position.
                            user.marker.setPosition(panorama.getPosition());
                            user.marker.setVisible(true);
                            mapView = 'road';
                            user.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                            $('#mapView pre').html(mapViewSatelliteHtml);
                        }
                    }.bind(this));
                }

                if (mapView === 'satellite') {

                    // Set the panorama to the user position.
                    panorama.setPosition(user.marker.getPosition());
                    user.marker.setVisible(false);
                    panorama.setVisible(true);
                    mapView = 'street';
                    $('#mapView pre').html(mapViewRoadHtml);
                } else if (mapView === 'street') {
                    // Managed above.
                } else {
                    mapView = 'satellite';
                    user.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
                    $('#mapView pre').html(mapViewStreetHtml);
                }
            }.bind(this));

            user.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(mapViewDiv);
        },

        initNotifications: function() {
            var notificationsDiv = document.createElement('div');
            notificationsDiv.setAttribute('id', 'notifications');
            notificationsDiv.innerHTML = '<pre class="control actionable-control"><i class="fa fa-fw fa-tablet"></i></pre>';

            google.maps.event.addDomListener(notificationsDiv, 'click', function() {
                $('#map').trigger('notification:toggle');
            });

            user.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(notificationsDiv);
        },

        initStatics: function() {

            // Github.
            var githubDiv = document.createElement('div');
            githubDiv.setAttribute('id', 'github');

            githubDiv.innerHTML = '<pre class="control actionable-control"><i class="fa fa-fw fa-github-alt"></i></pre>';

            google.maps.event.addDomListener(githubDiv, 'click', function() {
                 var form = document.createElement("form");
                 form.method = "GET";
                 form.action = "https://github.com/badassquest/badassquest";
                 form.target = "_blank";
                 document.body.appendChild(form);
                 form.submit();
            });

            user.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(githubDiv);

            // Twitter.
            var twitterDiv = document.createElement('div');
            twitterDiv.setAttribute('id', 'twitter');

            twitterDiv.innerHTML = '<pre class="control actionable-control"><i class="fa fa-fw fa-twitter"></i></pre>';

            google.maps.event.addDomListener(twitterDiv, 'click', function() {
                 var form = document.createElement("form");
                 form.method = "GET";
                 form.action = "https://twitter.com/DavidMonllao";
                 form.target = "_blank";
                 document.body.appendChild(form);
                 form.submit();
            });

            user.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(twitterDiv);
        }
    };

    return Controls;
});
