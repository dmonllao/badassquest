define(['bs', 'story/Free', 'UI', 'Icon', 'InfoWindow', 'Mission', 'Foe'], function($, StoryFree, UI, Icon, InfoWindow, Mission, Foe) {

    ForPresident.prototype = Object.create(StoryFree.prototype);

    function ForPresident(user, game) {
        StoryFree.call(this, user, game);
        this.title = 'Badass for president';
    }

    return ForPresident;
});
