define(['bs', 'Const', 'Generator'], function($, Const, Generator) {

    // Sprite hardcoded values.
    var bodyScale = 0.8;

    // They are 250x250.
    var headScale = 0.33;

    var spriteWidth = 99;
    var spriteHeight = 65;

    function Foe(attrs) {

        this.id = this.generateId();
        this.attrs = attrs;

        // We want them all defined.
        for (var attr in this.attrs) {
            if (this.attrs.hasOwnProperty(attr)) {
                if (this.attrs[attr] === null) {
                    console.error('Missing ' + attr + ' foe attribute');
                    this.attrs[attr] = 1;
                }
            }
        }

        // Initialise instance.
        this.spriteData = {};
        this.state = {};

        this.state['cHealth'] = this.attrs.tHealth;


        // Default one.
        this.image = this.setFaceImage(Const.defaultFoePic);
        return this;
    }

    Foe.prototype = {
        id: null,
        attrs: {
            name: null,
            tHealth: null,
            speed: null,
            attack: null,
            defense: null
        },
        state: null,
        image: null,

        user: null,

        bounceCounter: 0,
        direction: 'right',

        spriteData: null,

        generateId: function() {
            return Math.floor(Math.random() * 1000) * Math.floor(Date.now() / 1000);
        },

        isDead: function() {
            if (this.state.cHealth <= 0) {
                return true;
            }
            return false;
        },

        setFaceImage: function(imageUrl) {
            this.image = imageUrl;
        },

        setUser: function(user) {
            this.user = user;
        },

        attackTurn: function(game, callback) {

            var damage = Generator.foeDamage(this.attrs.attack, this.user);

            setTimeout(function() {
                this.user.updateState({
                    cHealth: this.user.state.cHealth - damage
                })
                callback();
            }.bind(this), Const.foeAttackTime);

            return damage;
        },

        preloadAssets: function(game) {
            game.load.image('face' + this.id, this.image);
            game.load.image('healthBarFoe' + this.id, this.image);

            // TODO This should be a foe constructor attribute.
            // Include the foe id as it should be unique.
            game.load.spritesheet('body' + this.id, 'img/foe-body-sprites.png', spriteWidth, spriteHeight, 6);
        },

        createSprite: function(game, x, y) {

            this.spriteData.sprite = game.add.sprite(x, y);

            // Body and legs scaled at 1/2 size and head size doubled.
            this.spriteData.body = this.spriteData.sprite.addChild(game.make.sprite(0, 0, 'body' + this.id));
            this.spriteData.body.scale.setTo(bodyScale, bodyScale);

            var animation = this.spriteData.body.animations.add('skizo');
            animation.play(10, true);

            // Divided by 2 to position it at half body, will be adjusted later decreasing it by half head width.
            this.spriteData.head = this.spriteData.sprite.addChild(game.make.sprite(
                this.spriteData.body.getBounds().width * bodyScale / 2,
                0,
                'face' + this.id
            ));
            this.spriteData.head.scale.setTo(headScale, headScale);

            // Head should consider its own width.
            this.spriteData.head.x = this.spriteData.head.x - (this.spriteData.head.getBounds().width * headScale) / 2;

            // Set the head above the body.
            this.spriteData.head.y = this.spriteData.head.y - (this.spriteData.head.getBounds().height * headScale);

            game.physics.enable(this.spriteData.sprite, Phaser.Physics.ARCADE);

            //  This gets it moving
            var yVelocity = Generator.getRandomIndex(200);
            this.spriteData.sprite.body.velocity.setTo(200, yVelocity);
            // Only sometimes.
            if (Generator.getRandomIndex(2)) {
                this.spriteData.sprite.body.velocity.x *= -1;
            }

            //  This makes the game world bounce-able
            this.spriteData.sprite.body.collideWorldBounds = true;
            //  This sets the image bounce energy for the horizontal and vertical vectors
            // (as an x,y point). "1" is 100% energy return
            this.spriteData.sprite.body.bounce.set(0.8);
            this.spriteData.sprite.body.gravity.set(0, 180);

            return this.spriteData.sprite;
        },

        updateCanvas: function(game) {

            if (this.isDead()) {
                return;
            }

            // Check that the spriteData is available.
            if (this.spriteData.sprite.body) {

                var currentDirection = null;
                if (this.spriteData.sprite.body.velocity.x > 0) {
                    currentDirection = 'right';
                } else {
                    currentDirection = 'left';
                }

                if (this.direction !== currentDirection) {
                    this.spriteData.body.scale.x *= -1;
                    this.spriteData.head.scale.x *= -1;
                }
                this.direction = currentDirection;

                // Make the sprite bounce again if it is close to the bottom for a while.
                if (this.spriteData.sprite.body.y > (game.world.height - 15)) {
                    this.bounceCounter++;
                } else {
                    // If it gets out of the bottom area is because it is still jumping too high.
                    this.bounceCounter = 0;
                }

                if (this.bounceCounter !== 0 && this.bounceCounter % 20 === 0) {
                    // Make the sprite bounce.

                    this.spriteData.sprite.body.velocity.setTo(200, 200);
                    // Only sometimes.
                    if (Generator.getRandomIndex(2)) {
                        this.spriteData.sprite.body.velocity.x *= -1;
                    }

                    this.spriteData.sprite.body.bounce.set(0.8);
                    this.bounceCounter = 0;
                }
            }

        }
    };

    return Foe;
});
