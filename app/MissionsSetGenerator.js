define(['bs', 'Const', 'MissionsChain', 'Mission', 'InfoWindow', 'Generator', 'PoiTypes'], function($, Const, MissionsChain, Mission, InfoWindow, Generator, PoiTypes) {

    var usedPlaces = {};

    function MissionsSetGenerator(map, game, user, employer, completedCallback) {
        this.map = map;
        this.game = game;
        this.user = user;

        this.employer = employer;
        this.completedCallback = completedCallback;

        return this;
    }

    MissionsSetGenerator.prototype = {
        map: null,
        game: null,
        user: null,

        employer: null,
        completedCallback : null,

        create: function(pois, ongoing) {

            // The length depends on the level where the politician contacts you.
            var limits = PoiTypes.getMissionLimits(this.employer.locationType);

            var missions = [];
            var missionNum = 0;
            for (var i = 0; i < pois.length; i++) {
                if (missionNum === limits) {
                    break;
                }

                // Skip already used pois.
                if (typeof usedPlaces[pois[i].place_id] !== 'undefined') {
                    continue;
                }

                if (ongoing && i < ongoing) {
                    // If we are creating missions for a resumed game we only create
                    // the remaining missions.
                    // Increase missionNum as well because these missions are already finished.
                    missionNum++;
                } else {
                    var mission = this.createMission(pois[i], (i + 1));
                    // We check that a mission for this poi can be created, if there
                    // are no remaining missions for this poi types we fetch another poi.
                    if (mission) {

                        usedPlaces[pois[i].place_id] = pois[i].place_id;
                        missions.push(mission);
                        missionNum++;
                    }
                }
            }

            // Set the chain of missions and start showing the first one.
            var missionsChain = new MissionsChain(this.map, this.game, this.user, this.employer, missions, this.completedCallback);
            missionsChain.setMissionLocation();

        },

        createMission: function(poiData, nMission) {

            // Selecting a random action, actions depend on the poi type.
            var actions = PoiTypes.getMissionActions(poiData.types);
            var actionType = Generator.getRandomElement(actions);

            // For each mission we are going to create we need a different:
            // - A message from the employer about the action to perform
            // - An action to run once the location is clicked
            // - A message from the employer with a congrats + reward
            // - A reward (integer).
            var missionData = Generator.getRandomMission(this.user, actionType);
            if (!missionData) {
                // False if no remaining missions.
                return;
            }

            // * nMission as reward should be incremental.
            var reward = Generator.getRandomReward(this.user) * nMission;

            // Add the reward to the info message.
            missionData.infoMessage += ' There is a $' + reward + ' reward. Click to see where should you go.';

            return new Mission({
                name: missionData.title,
                position: {lat: poiData.geometry.location.lat(), lng: poiData.geometry.location.lng()},
                icon: {
                    url: this.employer.image,
                    scaledSize: new google.maps.Size(40, 40)
                },
                cleanMission: true,
                process: function(doneCallback) {
                    var action = new actionType(this.user, this.game, poiData);
                    action.start(doneCallback);
                }.bind(this),
                infoMessage: {
                    message: missionData.infoMessage,
                    from: '<img src="' + this.employer.image + '" class="img-circle notification-img"> ' + this.employer.name + ' - ' + this.employer.location
                },
                doneMessage: {
                    message: missionData.doneMessage,
                    from: '<img src="' + this.employer.image + '" class="img-circle notification-img"> ' + this.employer.name
                },
                reward: reward
            });

        },
    };

    return MissionsSetGenerator;
});
