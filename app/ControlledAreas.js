define(['bs', 'Const'], function($, Const) {

    function ControlledAreas(map) {
        this.map = map;
        return this;
    }

    ControlledAreas.prototype = {
        map: null,

        pois: [],
        polygons: [],

        addPoi: function(poi) {
            this.pois.push(poi);
            this.redrawControlledAreas();
        },

        redrawControlledAreas: function() {

            // Clean up.
            for (var i in this.polygons) {
                this.polygons[i].setMap(null);
                this.polygons[i] = null;
            }
            this.polygons = [];

            var groupedPositions = this.getGroupedPositions();
            for (var i in groupedPositions) {

                // No need to draw anything.
                if (groupedPositions[i].length < 3) {
                    return;
                }
                this.addPolygon(groupedPositions[i]);
            }
        },

        getGroupedPositions: function() {

            var nearbyPositions = {};
            for (var i in this.pois) {
                var iPosition = this.pois[i].marker.getPosition();
                for (var j in this.pois) {

                    // Skip if same index.
                    if (i == j) {
                        continue;
                    }

                    // Skip it if we already have this i-j combination.
                    if (nearbyPositions[j] && nearbyPositions[j][i]) {
                        continue;
                    }

                    var jPosition = this.pois[j].marker.getPosition();
                    if (google.maps.geometry.spherical.computeDistanceBetween(iPosition, jPosition) < Const.areasPositionsDistance) {
                        if (!nearbyPositions[i]) {
                            nearbyPositions[i] = {};
                        }
                        nearbyPositions[i][j] = true;
                    }
                }
            }

            var groups = [];
            var indexGroup = {};
            for (var i in nearbyPositions) {
                if (nearbyPositions.hasOwnProperty(i)) {

                    var group = null;
                    var groupIndex = null;
                    if (typeof indexGroup[i] !== "undefined") {
                        // If the element is already part of a group let's use that group.
                        groupIndex = indexGroup[i];
                        group = groups[groupIndex];
                    } else {
                        // New group.
                        group = [i];
                        // The new length will be the next groups array index.
                        groupIndex = groups.push(group) - 1;
                        indexGroup[i] = groupIndex;
                    }

                    for (var j in nearbyPositions[i]) {
                        if (nearbyPositions[i].hasOwnProperty(j)) {

                            if (typeof indexGroup[j] !== "undefined" && indexGroup[j] != groupIndex) {
                                // If this position already have a group merge the previous group into this one.
                                var toMergeIndex = indexGroup[j];
                                var toMerge = groups[toMergeIndex];

                                // Update all references from j previous group members to the current group.
                                for (var pos in indexGroup) {
                                    if (indexGroup.hasOwnProperty(pos) && indexGroup[pos] == toMergeIndex) {
                                        indexGroup[pos] = groupIndex;
                                    }
                                }
                                group = group.concat(toMerge);
                                // toMerge index not removed just emptied as otherwise all pointers to groups indexes would change.
                                groups[toMergeIndex] = new Array();
                                groups[groupIndex] = group;
                            } else if (indexGroup[j] != groupIndex) {
                                // Set the position in this group.
                                group.push(j);
                                indexGroup[j] = groupIndex;
                            } else {
                                // No need to add it, it is already there.
                            }
                        }
                    }
                }
            }

            // Clean up.
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].length === 0) {
                    groups.splice(i, 1);
                }
            }

            return groups;
        },

        addPolygon: function(group) {

            var bounds = new google.maps.LatLngBounds();
            var positions = [];
            for (var i in group) {
                positions.push(this.pois[group[i]].marker.getPosition());
                bounds.extend(this.pois[group[i]].marker.getPosition());
            }

            bearingSort = function(a,b) {
                return (a.bearing - b.bearing);
            };
            var center = bounds.getCenter();
            var bearing = [];
            for (var i in positions) {
                positions[i].bearing = google.maps.geometry.spherical.computeHeading(center, positions[i]);
            }
            positions.sort(bearingSort);

            // Construct the polygon.
            var polygon = new google.maps.Polygon({
                paths: positions,
                strokeColor: '#399234',
                strokeOpacity: 0.6,
                strokeWeight: 2,
                fillColor: '#399234',
                fillOpacity: 0.15
            });
            polygon.setMap(this.map);

            this.polygons.push(polygon);
        },

    };

    return ControlledAreas;
});
