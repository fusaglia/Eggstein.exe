class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');

        this.worldWidth = 7680;
        this.worldHeight = 4320;
        this.playerSpeed = 320;
    }
    
    createGrassTexture() {
        const g = this.add.graphics();
        g.fillStyle(0x4f8f3b, 1);
        g.fillRect(0, 0, 128, 128);

        for (let i = 0; i < 180; i += 1) {
            const x = Phaser.Math.Between(0, 127);
            const y = Phaser.Math.Between(0, 127);
            const color = Phaser.Math.RND.pick([0x5aa244, 0x6eb256, 0x427a31, 0x79bf5f]);
            g.fillStyle(color, Phaser.Math.FloatBetween(0.2, 0.45));
            g.fillCircle(x, y, Phaser.Math.Between(1, 3));
        }

        g.generateTexture('grassTile', 128, 128);
        g.destroy();
    }

    createObstacleTextures() {
        const rock = this.add.graphics();
        rock.fillStyle(0x6d7078, 1);
        rock.fillEllipse(50, 50, 86, 70);
        rock.fillStyle(0x868a93, 0.9);
        rock.fillEllipse(35, 40, 26, 20);
        rock.fillStyle(0x5c5f67, 0.9);
        rock.fillEllipse(68, 62, 20, 14);
        rock.generateTexture('rock', 100, 100);
        rock.destroy();

        const bush = this.add.graphics();
        bush.fillStyle(0x2d7a2f, 1);
        bush.fillCircle(32, 44, 24);
        bush.fillCircle(60, 38, 28);
        bush.fillCircle(82, 54, 24);
        bush.fillCircle(56, 64, 30);
        bush.fillStyle(0x47a34a, 0.9);
        bush.fillCircle(42, 36, 10);
        bush.fillCircle(72, 48, 12);
        bush.generateTexture('bush', 112, 100);
        bush.destroy();
    }

    createPlayerTexture() {
        const playerGraphic = this.add.graphics();
        playerGraphic.fillStyle(0xb0b0b0, 1);
        playerGraphic.fillCircle(22, 22, 20);
        playerGraphic.lineStyle(2, 0x8e8e8e, 0.9);
        playerGraphic.strokeCircle(22, 22, 20);
        playerGraphic.generateTexture('playerCircle', 44, 44);
        playerGraphic.destroy();
    }

    applyObstacleHitbox(obstacle, textureKey) {
        const body = obstacle.body;
        const width = obstacle.displayWidth;
        const height = obstacle.displayHeight;

        if (textureKey === 'rock') {
            const radius = Math.floor(Math.min(width, height) * 0.34);
            const offsetX = Math.floor(width * 0.5 - radius);
            const offsetY = Math.floor(height * 0.5 - radius);
            body.setCircle(radius, offsetX, offsetY);
            return;
        }

        // per i cespugli, nascondi il corpo principale
        // la hitbox sarà formata da 4 cerchi sovrapposti creati separatamente
        body.setSize(1, 1);
        body.setOffset(width * 0.5, height * 0.5);
    }

    createBushSensors(bushX, bushY, bushScale) {
        // crea 4 cerchi invisibili per la hitbox precisa del cespuglio
        // basati sulla posizione dei 4 cerchi visivi del cespuglio
        const baseRadius = 24 * bushScale;
        const sensors = [];

        // cerchio 1: in alto a sinistra (32, 44)
        const s1 = this.bushSensors.create(bushX + 32 * bushScale - 56 * bushScale, bushY + 44 * bushScale - 50 * bushScale);
        s1.setCircle(baseRadius * 1.0);
        s1.setImmovable(true);
        s1.body.moves = false;
        s1.setVisible(false);
        sensors.push(s1);

        // cerchio 2: in alto a destra (60, 38)
        const s2 = this.bushSensors.create(bushX + 60 * bushScale - 56 * bushScale, bushY + 38 * bushScale - 50 * bushScale);
        s2.setCircle(baseRadius * 1.15);
        s2.setImmovable(true);
        s2.body.moves = false;
        s2.setVisible(false);
        sensors.push(s2);

        // cerchio 3: in basso a destra (82, 54)
        const s3 = this.bushSensors.create(bushX + 82 * bushScale - 56 * bushScale, bushY + 54 * bushScale - 50 * bushScale);
        s3.setCircle(baseRadius * 1.0);
        s3.setImmovable(true);
        s3.body.moves = false;
        s3.setVisible(false);
        sensors.push(s3);

        // cerchio 4: in basso al centro (56, 64)
        const s4 = this.bushSensors.create(bushX + 56 * bushScale - 56 * bushScale, bushY + 64 * bushScale - 50 * bushScale);
        s4.setCircle(baseRadius * 1.25);
        s4.setImmovable(true);
        s4.body.moves = false;
        s4.setVisible(false);
        sensors.push(s4);

        return sensors;
    }

    placeRandomObstacles(textureKey, count, minScale, maxScale) {
        for (let i = 0; i < count; i += 1) {
            const x = Phaser.Math.Between(120, this.worldWidth - 120);
            const y = Phaser.Math.Between(120, this.worldHeight - 120);
            const obstacle = this.obstacles.create(x, y, textureKey);
            const scale = Phaser.Math.FloatBetween(minScale, maxScale);
            obstacle.setScale(scale);
            obstacle.setImmovable(true);
            obstacle.body.moves = false;
            this.applyObstacleHitbox(obstacle, textureKey);
            if (textureKey === 'bush') {
                this.createBushSensors(x, y, scale);
            }
        }
    }

    createBush(x, y, scale) {
        // crea un cespuglio alla posizione x y con la scala scale, sia texture che hitbox e lo aggiunge al gruppo this.obstacles
        const bush = this.obstacles.create(x, y, 'bush');
        bush.setScale(scale);
        bush.setImmovable(true);
        bush.body.moves = false;
        this.applyObstacleHitbox(bush, 'bush');
        // crea i 4 cerchi invisibili per la hitbox precisa
        this.createBushSensors(x, y, scale);
        return bush;
    }

    create() {
        this.createGrassTexture();
        this.createObstacleTextures();
        this.createPlayerTexture();

        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.add.tileSprite(
            this.worldWidth / 2,
            this.worldHeight / 2,
            this.worldWidth,
            this.worldHeight,
            'grassTile'
        );

        this.obstacles = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // gruppo per i sensori circolari invisibili dei cespugli
        this.bushSensors = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        this.placeRandomObstacles('rock', 95, 0.8, 1.35);
        this.placeRandomObstacles('bush', 120, 0.75, 1.25);

        this.player = this.physics.add.sprite(
            this.worldWidth / 2,
            this.worldHeight / 2,
            'playerCircle'
        );
        this.player.setCircle(18, 4, 4);
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.collider(this.player, this.bushSensors);

        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.setDefaultCursor('crosshair');
    }

    update() {
        let dirX = 0;
        let dirY = 0;

        if (this.keys.left.isDown || this.cursors.left.isDown) {
            dirX -= 1;
        }
        if (this.keys.right.isDown || this.cursors.right.isDown) {
            dirX += 1;
        }
        if (this.keys.up.isDown || this.cursors.up.isDown) {
            dirY -= 1;
        }
        if (this.keys.down.isDown || this.cursors.down.isDown) {
            dirY += 1;
        }

        if (dirX === 0 && dirY === 0) {
            this.player.setVelocity(0, 0);
            return;
        }

        const length = Math.hypot(dirX, dirY);
        const velocityX = (dirX / length) * this.playerSpeed;
        const velocityY = (dirY / length) * this.playerSpeed;

        this.player.setVelocity(velocityX, velocityY);

    }
}

//const imageCache = new Map();
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        },
        debug: true
    },
    scene: [BootScene]
};
let game = null;

function startGame() {
    if (game) {
        game.destroy(true);
    }

  game = new Phaser.Game(config);
  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
}

startGame();

