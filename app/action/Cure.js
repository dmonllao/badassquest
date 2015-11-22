define(['bs', 'action/Base'], function($, ActionBase) {

    ActionCure.prototype = Object.create(ActionBase.prototype);

    function ActionCure(user, game, marker, poiData) {
        ActionBase.call(this, user, game, marker, poiData);
        return this;
    }

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

            // Update the user state.
            this.user.updateState({
                cHealth: this.user.attrs.tHealth
            });

            this.user.addExperience(5);

        }.bind(this));

        return rendererPromise;
    };

    return ActionCure;
});
