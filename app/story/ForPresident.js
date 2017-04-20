define(['bs', 'story/Free', 'UI', 'Icon', 'InfoWindow', 'Mission', 'Foe'], function($, StoryFree, UI, Icon, InfoWindow, Mission, Foe) {

    ForPresident.prototype = Object.create(StoryFree.prototype);

    function ForPresident(user, game) {
        StoryFree.call(this, user, game);
    }

    ForPresident.prototype.getIntro = function() {
        return '<div>Badass for president</div><div><input id="place-input" class="form-control"/></div>';
    };

    return ForPresident;
});
