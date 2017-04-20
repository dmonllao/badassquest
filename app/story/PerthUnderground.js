define(['bs', 'story/Base', 'UI', 'Icon', 'InfoWindow', 'Mission', 'Foe'], function($, StoryBase, UI, Icon, InfoWindow, Mission, Foe) {

    PerthUnderground.prototype = Object.create(StoryBase.prototype);

    function PerthUnderground(user, game) {
        StoryBase.call(this, user, game);

        this.title = 'Perth underground';

        // West Perth.
        this.initialPosition = {lat: -31.948357, lng: 115.8408308};

        // Setting them in here as google.maps will already be available.
        this.missions = [
            // Specify everything in here; name, position and icon have preference over the place ones.
            new Mission({
                name: 'Random witness',
                placeid: 'ChIJL_U8syG7MioRJxobWh5So7k',
                position: {lat: -31.94822952, lng: 115.84812641},
                preMessage: {
                    from: 'Waiter',
                    message: 'The witness waits for you there'
                },
                icon: Icon.getByType('idea'),
                cleanMission: true,
                content: 'I haven\'t really seen anything, just someone running. Probably worth going to the police station.'
            }),
            // Just custom data, no need to point to real places.
            new Mission({
                name: 'Perth Police Station',
                position: {lat: -31.946606, lng: 115.852482},
                icon: Icon.getByType('police'),
                content: 'That sounds bad mate, second case this week. This is the other family address, you can support each other, go see them.'
            }),
            new Mission({
                name: 'The Robinsons house',
                position: {lat: -31.935394209989067, lng: 115.86165815591812},
                icon: Icon.getByType('home'),
                content: 'Yesterday I received a phone call, don\'t tell anyone, I am too scared to go alone, please come with me; I\'ve marked the position in the map.'
            }),
            // process attr contains the action workflow.
            new Mission({
                name: '???',
                position: {lat: -31.94608420088298, lng: 115.88047921657562},
                icon: Icon.getByFont('EXCLAMATION'),
                cleanMission: true,
                content: '<p>Gimme all you have you cunts!</p>' + UI.renderActionButtons([
                        {
                            id: 'pay',
                            text: 'Do as he said'
                        }, {
                            id: 'fight',
                            text: 'Fight him'
                        }, {
                            id: 'run',
                            text: 'Run!'
                        }
                    ]),
                process: function() {

                    $('#pay').on('click', function(ev) {

                        this.user.updateState({
                            cWealth: 0
                        });
                        InfoWindow.closeAll();
                        $('#text-action-content').html('<p>hehehe, now run with your mummy!</p>');
                        $('#text-action').modal('show');
                    }.bind(this));

                    $('#fight').on('click', function(ev) {

                        var foe = new Foe({
                            name: 'Charles Manson',
                            tHealth: 100,
                            speed: 3,
                            attack: 2,
                            defense: 8,
                            duration: 10000,
                            reRouteLimit: 3
                        });
                        foe.setFaceImage('https://upload.wikimedia.org/wikipedia/commons/9/95/CharlesManson2014.jpg');

                        var args = {
                            user: this.user,
                            foes: [foe],
                            wonCallback: function() {
                                this.content = 'Please, don\'t hurt me.'
                                this.infoWindow.setContent(this.content + ' I have no idea where your children are, I just hear the guys talking in Northbridge.');
                                this.complete()
                                $('#game-action').modal('hide');
                            }.bind(this)
                        };
                        this.game.state.start('Fight', true, false, args);
                        $('#game-action').modal('show');
                    }.bind(this));

                    $('#run').on('click', function(ev) {
                        InfoWindow.closeAll();
                    });
                }
            }),
            // All poi data is contained in the place.
            new Mission({
                placeid: 'ChIJI0gEfSm7MioR7yWId2npZcg',
                icon: Icon.getByType('institution'),
                content: 'Finished.'
            })
        ];
    }

    PerthUnderground.prototype.getIntro = function() {
        return 'Someone kidnapped your daugther Bubitz while paying lunch. The waiter tells you that a wintess is waiting for you a few streets East.';
    };

    PerthUnderground.prototype.getTheEnd = function() {
        return 'You found her there. Lucky you that the mother didn\'t realise.';
    };

    return PerthUnderground;
});
