define(['bs', 'action/Base', 'Sound'], function($, ActionBase, Sound) {

    function ActionCure(user, game, poiData, marker) {
        ActionBase.call(this, user, game, poiData, marker);
        return this;
    }
    ActionCure.prototype = Object.create(ActionBase.prototype);
    ActionCure.prototype.constructor = ActionCure;

    ActionCure.prototype.getVisibleName = function() {
        return 'Visit the doctor';
    }

    ActionCure.prototype.render = function() {

        // Renderer promise.
        var rendererPromise = $.Deferred();

        // Get the header
        var headerPromise = this.printHeader();

        // Once we have the header we concat the body and resolve the renderer promise.
        headerPromise.done(function(html) {
            html = html + '<div class="info-box"><p>Hey amigo! Your health has been restored, enjoy your day and behave!</p></div>';
            rendererPromise.resolve(html);

            Sound.play('heal');

            // Update the user state.
            this.user.updateState({
                cHealth: this.user.attrs.tHealth
            });

            this.user.addExperience(5);

            this.doneCallback();

        }.bind(this));

        return rendererPromise;
    };

    return ActionCure;
});
