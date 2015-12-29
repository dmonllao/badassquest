define(['bs', 'Const', 'StepsChain', 'StoryStep', 'InfoWindow', 'Generator', 'PoiTypes'], function($, Const, StepsChain, StoryStep, InfoWindow, Generator, PoiTypes) {

    function MissionsSet(map, game, user, employer, icon, completedCallback) {
        this.map = map;
        this.game = game;
        this.user = user;

        this.employer = employer;
        this.icon = icon;
        this.completedCallback = completedCallback;

        return this;
    }

    MissionsSet.prototype = {
        map: null,
        game: null,
        user: null,

        employer: null,
        icon: null,
        completedCallback : null,

        create: function(pois) {

            var steps = [];
            for (var i = 0; i < pois.length; i++) {
                var step = this.createStep(pois[i]);
                if (step) {
                    steps.push(step);
                }
            }

            // Set the chain of steps and start showing the first one.
            var stepsChain = new StepsChain(this.map, this.game, this.user, steps, this.completedCallback);
            stepsChain.setStepLocation();

        },

        createStep: function(poiData) {

            // Selecting a random action, actions depend on the poi type.
            var actions = PoiTypes.getMissionActions(poiData.types);
            var actionType = Generator.getRandomElement(actions);

            // For each step we are going to create we need a different:
            // - A message from the employer about the action to perform
            // - An action to run once the location is clicked
            // - A message from the employer with a congrats + reward
            // - A reward (integer).
            var missionData = Generator.getRandomMission(this.user, actionType);
            if (!missionData) {
                // Stop if no remaining missions.
                return;
            }

            var reward = Generator.getRandomReward(this.user);

            // Add the reward to the info message.
            missionData.infoMessage += 'There is a $' + reward + ' reward. Click to see where should you go.';

            return new StoryStep({
                name: missionData.title,
                position: {lat: poiData.geometry.location.lat(), lng: poiData.geometry.location.lng()},
                icon: {
                    url: this.icon,
                    scaledSize: new google.maps.Size(40, 40)
                },
                cleanStep: true,
                process: function(doneCallback) {
                    var action = new actionType(this.user, this.game, poiData);
                    action.start(doneCallback);
                }.bind(this),
                infoMessage: {
                    message: missionData.infoMessage,
                    from: this.employer
                },
                doneMessage: {
                    message: missionData.doneMessage,
                    from: this.employer
                },
                reward: reward
            });

        },
    };

    return MissionsSet;
});
