define(['bs', 'story/Free', 'UI', 'Icon', 'InfoWindow', 'Mission', 'Foe'], function($, StoryFree, UI, Icon, InfoWindow, Mission, Foe) {

    ForPresident.prototype = Object.create(StoryFree.prototype);

    function ForPresident(user, game) {
        StoryFree.call(this, user, game);
    }

    ForPresident.prototype.getTitle = function() {
        var spinningMoney = '<i class="fa fa-money fa-spin fa-lg" style="color: green;"></i>';
        return spinningMoney + '&nbsp;&nbsp;&nbsp;Badass for president&nbsp;&nbsp;&nbsp;' + spinningMoney;
    };

    ForPresident.prototype.getIntro = function() {
        return '<div class="intro-text">A quest <i class="fa fa-map-o"></i> ' +
            'to release your inner badass <i class="fa fa-hand-rock-o" style="color: #B58A3F;"></i> ' +
            'in real world locations <i class="fa fa-map-marker" style="color: #e15c5c"></i></div>' +
            '<div><input autofocus id="place-input" class="form-control" placeholder="Enter a city" disabled/></div>';
    };

    return ForPresident;
});
