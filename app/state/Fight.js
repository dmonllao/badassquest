define(['Phaser', 'Const', 'Generator', 'Util', 'External', 'Sound', 'UI', 'HealthBar'], function(Phaser, Const, Generator, Util, External, Sound, UI, HealthBar) {

    var fightInfoShown = false;

    var game = null;

    var particlesManager = null;
    var foesEmitter = null;
    var userEmitter = null;

    var barMargin = 10;

    function StateFight(appGame) {
        game = appGame;
    }

    StateFight.prototype = {

        characters: [],

        foeSprites: {},

        finished: false,

        userHealthBar: null,

        foesHealthBars: {},

        init: function(args) {

            // Clean up from last use.
            this.characters = [];
            this.foeSprites = {};
            this.finished = false;

            // Required params.
            this.user = args.user;
            this.foes = args.foes;
            for (var i in this.foes) {
                // We need to set the user so they can attack it.
                this.foes[i].setUser(this.user);
            }

            // Optional params.
            this.location = args.location;
            this.wonCallback = args.wonCallback;

            this.establishTurnsOrder();
        },

        establishTurnsOrder: function() {

            // Foes.
            for (var i in this.foes) {
                var character = this.foes[i];
                character.prepareTurn = this.removeFoesHits.bind(this);
                character.counter = 0;
                character.type = 'foe';

                this.characters.push(character);
            }

            // The player.
            var player = this.user;
            player.prepareTurn = this.enableFoesHits.bind(this);
            player.counter = 0;
            player.type = 'player';
            this.characters.push(player);

            // The one with more speed starts and one turn each after that.
            this.characters.sort(function(c1, c2) {
                return c2.attrs.speed - c1.attrs.speed;
            });
        },

        preload: function() {

            for (var i in this.foes) {
                this.foes[i].preloadAssets(game);
            }

            // Particle.
            game.load.image('particle', 'img/pixel2x2_red.png');

            // Same size than the whole game canvas.
            game.load.image('background', this.getBackground());
        },

        getBackground: function() {
            var size = Util.getGameSize();

            var img = 'img/default-battlefield.png';
            if (this.location) {
                img = External.getStreetViewImage(this.location, size.width, size.height);
            }
            game.load.image('background', img);
        },

        create: function() {

            var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
            background.anchor.set(0.5);

            // Hit particles stuff.
            game.physics.startSystem(Phaser.Physics.ARCADE);
            foesEmitter = game.add.emitter(0, 0, 100);
            foesEmitter.makeParticles('particle');
            foesEmitter.gravity = 200;
            userEmitter = game.add.emitter(0, 0, 100);
            userEmitter.makeParticles('particle');
            userEmitter.gravity = 200;

            // Depends on the number of foes we have.
            var foeSpacing = game.world.width / this.foes.length;

            // To center it (although it should consider the foe width.
            var foeX = foeSpacing / 2;

            // Some top spacing.
            var foeY = Util.getGameHealthBarHeight() + 70;

            var foesHealthBarY = barMargin;
            for (var i in this.foes) {
                var foeSprite = this.foes[i].createSprite(game, foeX, foeY);

                foeSprite.inputEnabled = true;

                // Add them to the list so later we can play with them, same index than in foes.
                this.foeSprites[i] = foeSprite;

                foeX = foeX + foeSpacing;

                var xPosition = game.world.width - barMargin - Util.getGameHealthBarWidth();
                var yPosition = foesHealthBarY;
                this.foesHealthBars[i] = new HealthBar(game, xPosition, yPosition, Util.getGameHealthBarWidth(), Util.getGameHealthBarHeight());
                foesHealthBarY = foesHealthBarY + (Util.getGameHealthBarHeight() * 2);
            }

            this.userHealthBar = new HealthBar(game, barMargin, barMargin, Util.getGameHealthBarWidth(), Util.getGameHealthBarHeight());

            if (fightInfoShown === false) {
                var content = '<h1>Fights tip</h1><p>Tap quickly over your enemies to kill them once your turn starts. You can escape the fight by clicking out of the fight area.</p>' + UI.renderOkButton('Continue', 'btn btn-warning');
                UI.showModal(content);

                $('#ok').on('click', function(ev) {
                    // Start the next turn.
                    $('#text-action').modal('hide');
                    $('#game-action').modal('show');
                    this.getNextTurn();
                }.bind(this));

                fightInfoShown = true;

            } else {
                // Start the next turn.
                this.getNextTurn();
                $('#text-action').modal('hide');
                $('#game-action').modal('show');
            }

        },

        getNextTurn: function() {

            // Prevent race condition. Fight might be over and next callback is still executed.
            if (this.finished) {
                return;
            }

            // Finish if the player is dead.
            if (this.user.isDead()) {
                return;
            }

            // Finish if all foes are dead.
            var anyAlive = false;
            for (var i in this.foes) {
                var isDead = this.foes[i].isDead();
                if (!isDead) {
                    anyAlive = true;
                } else if (isDead) {
                    // If the foe sprite still exists remove it.
                    this.foeSprites[i].destroy();
                }
            }
            if (anyAlive === false) {
                this.userWins();
                return;
            }

            // 0 index by default.
            var nextIndex = null;
            var nextCounter = 999999;

            // characters is sorted by attack order.
            for (var i in this.characters) {
                var character = this.characters[i];
                if (!character.isDead() && character.counter < nextCounter) {
                    // Following the order that was set, so an equals returns the lower index.
                    nextIndex = Number.parseInt(i);
                    nextCounter = this.characters[nextIndex].counter;
                }
            }

            if (nextIndex === null) {
                console.error('No next index!');
                return;
            }

            // Increment the counter for that index.
            this.characters[nextIndex].counter++;

            // Execute the character-type specific stuff and init the turn.
            this.characters[nextIndex].prepareTurn();
            var damage = this.characters[nextIndex].attackTurn(game, this.getNextTurn.bind(this));

            // Only foes return the damage done.
            if (damage) {
                this.userHit(damage);
            }
        },

        enableFoesHits: function() {
            for (var i in this.foeSprites) {
                if (this.foeSprites.hasOwnProperty(i)) {
                    // We attach the foe index.
                    this.foeSprites[i].events.onInputDown.add(this.foeHit.bind(this), this, 0, i);
                }
            }

            // Notify that your turn starts.
            var text = game.add.text(game.world.centerX, Util.getGameHealthBarHeight() + 50, 'Your turn! Hit them!');
            this.formatText(text, Util.getGameFontSize());

            // Show it while the user can attack.
            setTimeout(function() {
                text.destroy();
            }, Const.userAttackTime);
        },

        removeFoesHits: function() {
            for (var i in this.foeSprites) {
                if (this.foeSprites.hasOwnProperty(i)) {
                    if (this.foeSprites[i].events.onInputDown.getNumListeners() > 0) {
                        this.foeSprites[i].events.onInputDown.removeAll();
                    }
                }
            }
        },

        update: function() {
            for (var i in this.foes) {

                // Redraw to new position.
                if (!this.foes[i].isDead()) {
                    this.foes[i].updateCanvas(game);
                }

                // Update health bar.
                this.foesHealthBars[i].update();
            }
            this.userHealthBar.update();
        },

        userHit: function(damage) {

            var x = Generator.randomInteger(10, 10) + game.world.centerX;
            var y = Generator.randomInteger(10, 10) + game.world.centerY;
            var timeout = Generator.randomInteger(500, 500);

            // Blood.
            foesEmitter.x = x;
            foesEmitter.y = y;
            foesEmitter.start(true, 2000, null, 50);

            // Notify the damage points.
            var text = game.add.text(x, y, damage);
            this.formatText(text, Util.getGameFontSize());
            text.fill = '#FF2821';

            Sound.play('hurt');

            updatedHealth = ((this.user.state.cHealth - damage) / this.user.attrs.tHealth) * 100;
            this.userHealthBar.updateHealth(updatedHealth);

            // Show it while the user can attack.
            setTimeout(function() {
                text.destroy();
            }, 500);

        },

        foeHit: function(foeSprite, pointer, foeIndex) {

            var damagePoints = this.user.damageFoe(this.foes[foeIndex]);

            // Blood.
            foesEmitter.x = pointer.x;
            foesEmitter.y = pointer.y;
            foesEmitter.start(true, 3000, null, 20);

            // Notify the damage points.
            var text = game.add.text(pointer.x, pointer.y, damagePoints);
            this.formatText(text, 20);

            if (this.foes[foeIndex].isDead()) {
                Sound.play('kill');
            } else {
                Sound.play('hit');
            }

            updatedHealth = ((this.foes[foeIndex].state.cHealth - damagePoints) / this.foes[foeIndex].attrs.tHealth) * 100;
            this.foesHealthBars[foeIndex].updateHealth(updatedHealth);

            // Show it while the user can attack.
            setTimeout(function() {
                text.destroy();
            }, 500);
        },

        /**
         * Show you won + add experience.
         */
        userWins: function() {

            var experience = 0;
            for (var i in this.foes) {
                var foe = this.foes[i];
                experience = experience + foe.attrs.attack + foe.attrs.defense + foe.attrs.tHealth;
            }
            this.user.addExperience(experience);

            // You won info.
            setTimeout(function() {
                var text = game.add.text(game.world.centerX, game.world.centerY - 50, 'You won!');
                this.formatText(text);
            }.bind(this), 500);

            setTimeout(function() {
                var text = game.add.text(game.world.centerX, game.world.centerY + 50, 'Experience: ' + experience);
                this.formatText(text);
            }.bind(this), 1500);

            // And finally the callback if it was defined.
            if (this.wonCallback) {
                setTimeout(function() {
                    this.wonCallback();
                }.bind(this), 2500);
            }
        },

        finishFight: function() {
            this.finished = true;
        },

        formatText: function(text, size) {

            // Big one if undefined.
            if (typeof size === "undefined") {
                size = Util.getGameFontSize();
            }

            text.anchor.set(0.5);
            text.align = 'center';

            // Font style
            text.font = 'Graduate';
            text.fontSize = size;
            text.fontWeight = 'bold';

            // Stroke color and thickness
            text.stroke = '#000000';
            text.strokeThickness = 6;
            text.fill = '#43d637';
        }
    }

    return StateFight;
});
