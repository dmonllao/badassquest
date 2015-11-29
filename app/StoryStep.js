define(['jquery', 'InfoWindow'], function($, InfoWindow) {

    function StoryStep(data) {

        if (data.position) {
            this.position = data.position;
        }
        if (data.name) {
            this.name = data.name;
        }
        if (data.icon) {
            this.icon = data.icon;
        }
        if (data.placeid) {
            this.placeid = data.placeid;
        }

        // Info to be displayed, might change during the step life.
        if (data.info) {
            this.info = data.info;
        }

        if (data.cleanStep) {
            this.cleanStep = data.cleanStep;
        }

        if (data.process) {
            this.process = data.process;
        }

        return this;
    }

    StoryStep.prototype = {

        user: null,
        game: null,
        infoWindow: null,

        // Static data.
        position: null,
        name: null,
        icon: null,
        placeid: null,

        // Step process, a single function to manage everything, on complex workflows
        // would probably need to set new attributes.
        process: null,

        // Set to true to completely remove the step from the map once finished.
        cleanStep: false,

        // Is the step completed?.
        completed: false,

        // Callback to execute once the step is completed.
        completedCallback: null,

        // Info to display when the user clicks on the marker, this might change during
        // the step depending on its needs. Unset if no info should be displayed.
        info: null,

        setCompletedCallback: function(callback) {
            this.completedCallback = callback;
        },

        setUser: function(user) {
            this.user = user;
        },

        setGame: function(game) {
            this.game = game;
        },

        getInfo: function() {
            return this.info;
        },

        execute: function() {
            if (this.process !== null) {
                return this.process();
            }
            // If the step does not pass any execute function we just mark as completed.
            this.complete();
        },

        cleanIt: function() {
            return this.cleanStep;
        },

        complete: function() {
            this.completed = true;
            this.completedCallback();
        },

        isCompleted: function() {
            return this.completed;
        }
    };
    return StoryStep;
});
