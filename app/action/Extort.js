define(['bs', 'Util', 'Generator', 'Foe', 'UI', 'action/Base', 'Sound'], function($, Util, Generator, Foe, UI, ActionBase, Sound) {

    function ActionExtort(user, game, poiData, marker) {
        ActionBase.call(this, user, game, poiData, marker);

        this.extortText = null;

        return this;
    }
    ActionExtort.prototype = Object.create(ActionBase.prototype);
    ActionExtort.prototype.constructor = ActionExtort;

    ActionExtort.prototype.tax = null;

    ActionExtort.prototype.getName = function() {
        return 'ActionExtort';
    }

    ActionExtort.prototype.getVisibleName = function() {
        return 'Extort them';
    }

    ActionExtort.prototype.render = function() {

        // Renderer promise.
        var rendererPromise = $.Deferred();

        // Get the header.
        var headerPromise = this.printHeader();

        this.tax = Generator.poiExtortionTax(this.poiData);

        var text;
        if (this.user.canIntimidate(this.poiData)) {
            // They are intimidated and they will pay.
            text = this.getIntimidatedText() + UI.renderOkButton('Continue', 'btn btn-warning');
            this.extorted();
        } else {
            // You are not strong enough, they are not scared of you.

            text = '<p>Who do you think you are?? Leave before we smash you.</p>' +
                UI.renderActionButtons([
                    {
                        id: 'fight',
                        text: 'Fight them'
                    }, {
                        id: 'cancel',
                        text: 'Leave'
                    }
                ]);
        }

        // Once we have the header we concat the body and resolve the renderer promise.
        headerPromise.done(function(html) {
            html = html + '<div id="extort-info" class="info-box">' + text + '</div>';
            rendererPromise.resolve(html);
        }.bind(this));

        return rendererPromise;
    };

    ActionExtort.prototype.rendered = function() {

        this.extortText = $('#text-action-content').html();

        // Only useful for canIntimidate == true.
        $('#ok').on('click', function(ev) {
            $('#text-action').modal('hide');
        });

        $('#fight').on('click', function(ev) {

            var foes = Generator.foes(this.poiData);
            for (var i in foes) {
                foes[i] = new Foe(foes[i]);
                foes[i].setFaceImage(this.shopKeeperImage);
            }

            var args = {
                user: this.user,
                foes: foes,
                location: this.poiData.vicinity,
                wonCallback: function() {
                    $('#text-action-content').html(this.extortText);
                    $('#extort-info').html(this.getIntimidatedText());
                    UI.showModal($('#text-action-content').html(), 'Continue', 'btn btn-warning');
                    this.extorted();
                    $('#game-action').modal('hide');
                }.bind(this)
            };
            this.game.state.start('Fight', true, false, args);

        }.bind(this));

        $('#cancel').on('click', function(ev) {
            this.closeAction(ev);
        }.bind(this));

    };

    ActionExtort.prototype.getIntimidatedText = function() {
        return '<p>Please, don\'t hurt us. We will regularly pay you a $' + this.tax + ' tax.</p>';
    };

    ActionExtort.prototype.extorted = function() {
        this.user.addExperience(this.tax * 2);
        this.markAsDone(true, true);

        Sound.play('achievement');

        if (localStorage.getItem('achievementExtort1') === null) {
            this.user.addAchievement({
                category: 'basics',
                id: 'extorsion-1',
                title: 'businessman extorsion',
                image: '<i class="fa fa-hand-paper-o" style="color: #ffcc99"></i>'
            });
            localStorage.setItem('achievementExtort1', true)
        }

        this.doneCallback();

        // Only if there is a marker.
        if (this.marker) {
            this.user.addExtortion({
                poiData: this.poiData,
                marker: this.marker,
                amount: this.tax
            });
        }
    };

    return ActionExtort;
});
