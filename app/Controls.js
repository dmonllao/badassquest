define(['bs'], function($) {

    var map;

    function Controls(appMap) {
        map = appMap;
    }

    Controls.prototype = {

        init: function(user) {
            this.initHealth(user.state, user.attrs);
            this.initFood(user.state, user.attrs);
            this.initWealth(user.state, user.attrs);
            this.initLevel(user.state, user.attrs);

            this.initZoom();
            this.initCenter(user);
            this.initRadar();
        },

        update: function(state, attrs) {
            $('#health pre span').html(this.round(state.cHealth) + ' / ' + this.round(attrs.tHealth));
            $('#wealth pre span').html(this.round(state.cWealth));
            $('#food pre span').html(this.round(state.cFood) + ' / ' + this.round(attrs.tFood));
            $('#level pre span').html('Level ' + this.round(state.level));
        },

        round: function(value) {
            return Math.ceil(value);
        },

        initHealth: function(state, attrs) {
            var healthDiv = document.createElement('div');
            healthDiv.setAttribute('id', 'health');
            healthDiv.innerHTML = '<pre class="control"><i style="color: red;" class="fa fa-heart"></i><span>' + this.round(state.cHealth) + ' / ' + this.round(attrs.tHealth) + '</span></pre>';
            map.controls[google.maps.ControlPosition.LEFT_TOP].push(healthDiv);
        },

        initFood: function(state, attrs) {
            var foodDiv = document.createElement('div');
            foodDiv.setAttribute('id', 'food');
            foodDiv.innerHTML = '<pre class="control"><i style="color: #3366FF;" class="fa fa-bed"></i><span>' + this.round(state.cFood) + ' / ' + this.round(attrs.tFood) + '</span></pre>';
            map.controls[google.maps.ControlPosition.LEFT_TOP].push(foodDiv);
        },

        initWealth: function(state, attrs) {
            var wealthDiv = document.createElement('div');
            wealthDiv.setAttribute('id', 'wealth');
            wealthDiv.innerHTML = '<pre class="control"><i style="color: green;" class="fa fa-usd"></i><span>' + this.round(state.cWealth) + '</span></pre>';
            map.controls[google.maps.ControlPosition.LEFT_TOP].push(wealthDiv);
        },

        initLevel: function(state, attrs) {
            var levelDiv = document.createElement('div');
            levelDiv.setAttribute('id', 'level');
            levelDiv.innerHTML = '<pre class="control"><i style="color: #FFCC00;" class="fa fa-trophy"></i><span id="level-text">Level ' + state.level + '</span></pre>';
            map.controls[google.maps.ControlPosition.LEFT_TOP].push(levelDiv);
        },

        initZoom: function() {

            var zoomDiv = document.createElement('div');
            zoomDiv.setAttribute('id', 'zoom');
            zoomDiv.setAttribute('class', 'control actionable-control zoom');

            var zoomPlus = document.createElement('div');
            zoomPlus.setAttribute('id', 'zoom-plus');
            zoomPlus.innerHTML = '<i class="fa fa-plus"></i>';
            zoomDiv.appendChild(zoomPlus);

            var zoomMinus = document.createElement('div');
            zoomMinus.setAttribute('id', 'zoom-minus');
            zoomMinus.innerHTML = '<i class="fa fa-minus"></i>';
            zoomDiv.appendChild(zoomMinus);

            google.maps.event.addDomListener(zoomPlus, 'click', function() {
                map.setZoom(map.getZoom() + 1);
            });

            google.maps.event.addDomListener(zoomMinus, 'click', function() {
                map.setZoom(map.getZoom() - 1);
            });

            map.controls[google.maps.ControlPosition.RIGHT_TOP].push(zoomDiv);
        },

        initRadar: function() {
            var radarDiv = document.createElement('div');
            radarDiv.setAttribute('id', 'radar');
            radarDiv.innerHTML = '<pre class="control actionable-control"><i class="fa fa-eye"></i></pre>';

            google.maps.event.addDomListener(radarDiv, 'click', function() {
                $('#map').trigger('pois:get');
            });

            map.controls[google.maps.ControlPosition.RIGHT_TOP].push(radarDiv);
        },

        initCenter: function(user) {
            var centerDiv = document.createElement('div');
            centerDiv.setAttribute('id', 'center');
            centerDiv.innerHTML = '<pre class="control actionable-control"><i class="fa fa-arrows"></i></pre>';

            google.maps.event.addDomListener(centerDiv, 'click', function() {
                map.panTo(user.marker.getPosition());
            });

            map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerDiv);
        }

    };

    return Controls;
});
