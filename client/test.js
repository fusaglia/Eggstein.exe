// ─────────────────────────────────────────────
//  REGOLA HITBOX SENSORI — SPIEGAZIONE BREVE
//
//  Ogni sensore è un oggetto 1×1 creato con group.create(wx, wy).
//  L'origine dello sprite è (0.5, 0.5), quindi il body parte da
//  (wx - 0.5, wy - 0.5) ≈ (wx, wy).
//
//  setCircle(r, offsetX, offsetY): il cerchio ha l'angolo in alto
//  a sinistra in (body.x + offsetX, body.y + offsetY), quindi il
//  suo centro è a (body.x + offsetX + r, body.y + offsetY + r).
//
//  Per avere il centro esattamente in (wx, wy):
//    body.x + offsetX + r = wx
//    (wx - 0.5) + offsetX + r = wx
//    offsetX = 0.5 - r ≈ -r  (per r >> 0.5)
//
//  In pratica: setCircle(r, -r, -r) centra il cerchio sulla
//  posizione world dell'oggetto. Nessun altro offset serve.
//
//  Posizione world del centro di ciascun sensore:
//    wx = spriteX + (cx - textureW/2) * scale
//    wy = spriteY + (cy - textureH/2) * scale
// ─────────────────────────────────────────────

const ROCK_TYPES = {

    granite: {
        textureKey: 'rock_granite',
        textureW: 100, textureH: 80,
        draw(g) {
            g.fillStyle(0x6d7078, 1);
            g.fillPoints([
                { x: 18, y: 62 }, { x: 6,  y: 40 }, { x: 16, y: 18 },
                { x: 40, y: 6  }, { x: 70, y: 10 }, { x: 90, y: 28 },
                { x: 94, y: 54 }, { x: 76, y: 70 }, { x: 36, y: 76 },
            ], true);
            g.fillStyle(0x9a9ea8, 0.85);
            g.fillPoints([
                { x: 26, y: 28 }, { x: 40, y: 12 }, { x: 62, y: 16 },
                { x: 68, y: 32 }, { x: 50, y: 44 }, { x: 28, y: 42 },
            ], true);
            g.fillStyle(0x4a4d53, 0.7);
            g.fillPoints([
                { x: 56, y: 50 }, { x: 76, y: 58 }, { x: 82, y: 66 },
                { x: 56, y: 72 }, { x: 44, y: 62 },
            ], true);
            g.lineStyle(1.5, 0x3d3f44, 0.7);
            g.beginPath(); g.moveTo(50, 18); g.lineTo(44, 36); g.lineTo(52, 50); g.strokePath();
        },
        // cx, cy = centro cerchio in coordinate texture (px non scalati)
        // r      = raggio in px non scalati
        sensorCircles: [
            { cx: 38, cy: 36, r: 28 },
            { cx: 41, cy: 52, r: 23 },
            { cx: 62, cy: 40, r: 30 },
        ],
    },

    sandstone: {
        textureKey: 'rock_sandstone',
        textureW: 90, textureH: 96,
        draw(g) {
            g.fillStyle(0x9c6b45, 1);
            g.fillPoints([
                { x: 20, y: 88 }, { x: 4,  y: 56 }, { x: 12, y: 28 },
                { x: 30, y: 8  }, { x: 54, y: 2  }, { x: 74, y: 16 },
                { x: 86, y: 44 }, { x: 82, y: 74 }, { x: 58, y: 92 },
            ], true);
            g.fillStyle(0xc4875a, 0.8);
            g.fillPoints([
                { x: 24, y: 40 }, { x: 34, y: 12 }, { x: 58, y: 10 },
                { x: 66, y: 34 }, { x: 50, y: 52 }, { x: 28, y: 48 },
            ], true);
            g.fillStyle(0x6e4228, 0.65);
            g.fillPoints([
                { x: 48, y: 60 }, { x: 74, y: 70 }, { x: 78, y: 84 }, { x: 52, y: 90 },
            ], true);
            g.lineStyle(1.2, 0x5c3520, 0.75);
            g.beginPath(); g.moveTo(42, 16); g.lineTo(38, 38); g.lineTo(48, 52); g.strokePath();
            g.beginPath(); g.moveTo(60, 28); g.lineTo(64, 48); g.strokePath();
        },
        sensorCircles: [
            { cx: 46, cy: 38, r: 32 },
            { cx: 47, cy: 52, r: 39 },
        ],
    },

    obsidian: {
        textureKey: 'rock_obsidian',
        textureW: 120, textureH: 66,
        draw(g) {
            g.fillStyle(0x2e2e38, 1);
            g.fillPoints([
                { x: 8,  y: 52 }, { x: 2,  y: 32 }, { x: 20, y: 12 },
                { x: 52, y: 4  }, { x: 90, y: 8  }, { x: 114,y: 24 },
                { x: 118,y: 46 }, { x: 98, y: 60 }, { x: 36, y: 62 },
            ], true);
            g.fillStyle(0x4a4a5e, 0.9);
            g.fillPoints([
                { x: 18, y: 26 }, { x: 40, y: 8  }, { x: 82, y: 12 },
                { x: 92, y: 32 }, { x: 62, y: 46 }, { x: 24, y: 42 },
            ], true);
            g.fillStyle(0x8888aa, 0.28);
            g.fillPoints([
                { x: 30, y: 14 }, { x: 52, y: 8  }, { x: 66, y: 18 },
                { x: 52, y: 28 }, { x: 34, y: 24 },
            ], true);
            g.lineStyle(1, 0x1a1a22, 0.8);
            g.beginPath(); g.moveTo(70, 14); g.lineTo(74, 36); g.lineTo(60, 46); g.strokePath();
        },
        sensorCircles: [
            { cx: 30, cy: 35, r: 24 },
            { cx: 92, cy: 36, r: 23 },
        ],
        sensorRects: [
            { cx: 60, cy: 34, w: 55, h: 55 },
        ]
    },
};

// ─────────────────────────────────────────────

const BUSH_TYPES = {

    green: {
        textureKey: 'bush_green',
        textureW: 112, textureH: 100,
        sensorCircles: [
            { cx: 32, cy: 44, r: 24 },
            { cx: 60, cy: 38, r: 28 },
            { cx: 82, cy: 54, r: 24 },
            { cx: 56, cy: 64, r: 30 },
        ],
        draw(g) {
            g.fillStyle(0x2d7a2f, 1);
            g.fillCircle(32, 44, 24); g.fillCircle(60, 38, 28);
            g.fillCircle(82, 54, 24); g.fillCircle(56, 64, 30);
            g.fillStyle(0x47a34a, 0.9);
            g.fillCircle(42, 36, 10); g.fillCircle(72, 48, 12);
            g.fillStyle(0x1f5c21, 0.5); g.fillCircle(56, 72, 18);
        },
    },

    autumn: {
        textureKey: 'bush_autumn',
        textureW: 112, textureH: 100,
        sensorCircles: [
            { cx: 32, cy: 44, r: 24 },
            { cx: 60, cy: 38, r: 28 },
            { cx: 82, cy: 54, r: 24 },
            { cx: 56, cy: 64, r: 30 },
        ],
        draw(g) {
            g.fillStyle(0xb54a1a, 1);
            g.fillCircle(32, 44, 24); g.fillCircle(60, 38, 28);
            g.fillCircle(82, 54, 24); g.fillCircle(56, 64, 30);
            g.fillStyle(0xe07030, 0.85);
            g.fillCircle(42, 36, 10); g.fillCircle(72, 48, 12);
            g.fillStyle(0x7a2c0a, 0.55); g.fillCircle(56, 72, 18);
        },
    },

    thorn: {
        textureKey: 'bush_thorn',
        textureW: 112, textureH: 100,
        sensorCircles: [
            { cx: 32, cy: 44, r: 24 },
            { cx: 60, cy: 38, r: 28 },
            { cx: 82, cy: 54, r: 24 },
            { cx: 56, cy: 64, r: 30 },
        ],
        draw(g) {
            g.fillStyle(0x1e3d20, 1);
            g.fillCircle(32, 44, 24); g.fillCircle(60, 38, 28);
            g.fillCircle(82, 54, 24); g.fillCircle(56, 64, 30);
            g.fillStyle(0x2e5e30, 0.85);
            g.fillCircle(42, 36, 10); g.fillCircle(72, 48, 12);
            g.fillStyle(0x8b7355, 0.9);
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const bx = 56 + Math.cos(a) * 36, by = 50 + Math.sin(a) * 30;
                g.fillTriangle(bx, by,
                    bx + Math.cos(a + 0.4) * 6, by + Math.sin(a + 0.4) * 6,
                    bx + Math.cos(a - 0.4) * 6, by + Math.sin(a - 0.4) * 6);
            }
            g.fillStyle(0x111f12, 0.5); g.fillCircle(56, 72, 18);
        },
    },
};

// ─────────────────────────────────────────────
//  SCENE
// ─────────────────────────────────────────────

class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
        this.worldWidth  = 7680;
        this.worldHeight = 4320;
        this.playerSpeed = 320;
    }

    createGrassTexture() {
        const g = this.add.graphics();
        g.fillStyle(0x4f8f3b, 1);
        g.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 180; i++) {
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
        for (const def of Object.values(ROCK_TYPES)) {
            const g = this.add.graphics(); def.draw(g);
            g.generateTexture(def.textureKey, def.textureW, def.textureH);
            g.destroy();
        }
        for (const def of Object.values(BUSH_TYPES)) {
            const g = this.add.graphics(); def.draw(g);
            g.generateTexture(def.textureKey, def.textureW, def.textureH);
            g.destroy();
        }
    }

    createPlayerTexture() {
        const g = this.add.graphics();
        g.fillStyle(0xb0b0b0, 1); g.fillCircle(22, 22, 20);
        g.lineStyle(2, 0x8e8e8e, 0.9); g.strokeCircle(22, 22, 20);
        g.generateTexture('playerCircle', 44, 44);
        g.destroy();
    }

    createSensorTexture() {
        // Evita che i sensori usino la texture di default (es. 32x32),
        // che sposta il body in base a displayOriginX/Y.
        if (this.textures.exists('sensorDot')) return;
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 2, 2);
        g.generateTexture('sensorDot', 2, 2);
        g.destroy();
    }

    // ── Sensori fisici ───────────────────────
    //
    //  Creo un oggetto 1×1 alla posizione world (wx, wy) — centro del cerchio.
    //  setCircle(r, -r, -r) centra il cerchio esattamente su (wx, wy):
    //    centro fisico = body.x + offsetX + r
    //                  = (wx - 0.5) + (-r) + r
    //                  = wx - 0.5  ← errore di mezzo pixel, trascurabile
    //  (con r >> 0.5 l'approssimazione è perfetta)

    _createSensor(group, wx, wy, r) {
        const s = group.create(wx, wy, 'sensorDot');
        s.setVisible(false);
        // body.x = sprite.x - displayOriginX + offsetX
        // Vogliamo body.x = wx - r  =>  offsetX = displayOriginX - r
        s.body.setCircle(r);
        s.body.setOffset(s.displayOriginX - r, s.displayOriginY - r);
        s.setImmovable(true);
        s.body.moves = false;
        return s;
    }

    _createRectSensor(group, wx, wy, w, h) {
        const s = group.create(wx, wy, 'sensorDot');
        s.setVisible(false);

        // body.x = sprite.x - displayOriginX + offsetX
        // Vogliamo body.x = wx - w/2  => offsetX = displayOriginX - w/2
        // (stesso per Y)
        s.body.setSize(w, h);
        s.body.setOffset(s.displayOriginX - w * 0.5, s.displayOriginY - h * 0.5);
        s.setImmovable(true);
        s.body.moves = false;
        return s;
    }

    _spawnSensors(group, def, spriteX, spriteY, scale) {
        const hw = def.textureW / 2;
        const hh = def.textureH / 2;

        if (Array.isArray(def.sensorCircles)) {
            for (const { cx, cy, r } of def.sensorCircles) {
                const wx = spriteX + (cx - hw) * scale;
                const wy = spriteY + (cy - hh) * scale;
                this._createSensor(group, wx, wy, r * scale);
            }
        }

        // Rettangoli: puoi specificarli come centro (cx, cy, w, h)
        // oppure come top-left (x, y, w, h) in coordinate texture.
        if (Array.isArray(def.sensorRects)) {
            for (const rect of def.sensorRects) {
                const w = rect.w * scale;
                const h = rect.h * scale;

                const cx = (typeof rect.cx === 'number') ? rect.cx : (rect.x + rect.w * 0.5);
                const cy = (typeof rect.cy === 'number') ? rect.cy : (rect.y + rect.h * 0.5);

                const wx = spriteX + (cx - hw) * scale;
                const wy = spriteY + (cy - hh) * scale;

                this._createRectSensor(group, wx, wy, w, h);
            }
        }
    }

    // ── Factories ────────────────────────────

    addRockObstacle(x, y, scale = 1, type = 'granite') {
        const def = ROCK_TYPES[type] ?? ROCK_TYPES.granite;
        const rock = this.obstacles.create(x, y, def.textureKey);
        rock.setScale(scale);
        rock.setImmovable(true);
        rock.body.moves = false;
        rock.body.setSize(1, 1);
        this._spawnSensors(this.rockSensors, def, x, y, scale);
        return rock;
    }

    addBushObstacle(x, y, scale = 1, type = 'green') {
        const def = BUSH_TYPES[type] ?? BUSH_TYPES.green;
        const bush = this.obstacles.create(x, y, def.textureKey);
        bush.setScale(scale);
        bush.setImmovable(true);
        bush.body.moves = false;
        bush.body.setSize(1, 1);
        this._spawnSensors(this.bushSensors, def, x, y, scale);
        return bush;
    }

    addObstacle(x, y, obstacle = 'rock', type, scale = 1) {
        if (obstacle === 'rock') return this.addRockObstacle(x, y, scale, type);
        if (obstacle === 'bush') return this.addBushObstacle(x, y, scale, type);
    }

    _placeRandom(fn, count, minScale, maxScale) {
        for (let i = 0; i < count; i++) {
            fn(
                Phaser.Math.Between(150, this.worldWidth  - 150),
                Phaser.Math.Between(150, this.worldHeight - 150),
                Phaser.Math.FloatBetween(minScale, maxScale)
            );
        }
    }

    create() {
        this.createGrassTexture();
        this.createObstacleTextures();
        this.createPlayerTexture();
        this.createSensorTexture();

        

        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.add.tileSprite(
            this.worldWidth / 2, this.worldHeight / 2,
            this.worldWidth, this.worldHeight, 'grassTile'
        );

        this.obstacles   = this.physics.add.group({ allowGravity: false, immovable: true });
        this.rockSensors = this.physics.add.group({ allowGravity: false, immovable: true });
        this.bushSensors = this.physics.add.group({ allowGravity: false, immovable: true });
        
        this.addRockObstacle(3738, 2160, 1.1, 'obsidian');
        this.addRockObstacle(3738, 2300, 1.1, 'granite');
        this.addRockObstacle(3738, 2450, 1.1, 'sandstone');
        this.addBushObstacle(4047, 2160, 1.1, 'green');
        this.addBushObstacle(4047, 2300, 1.1, 'autumn');
        this.addBushObstacle(4047, 2450, 1.1, 'thorn');

        //this._placeRandom((x, y, s) => this.addRockObstacle(x, y, s, 'granite'),   40, 0.8, 1.35);
        //this._placeRandom((x, y, s) => this.addRockObstacle(x, y, s, 'sandstone'), 30, 0.7, 1.20);
        //this._placeRandom((x, y, s) => this.addRockObstacle(x, y, s, 'obsidian'),  25, 0.9, 1.40);
        //this._placeRandom((x, y, s) => this.addBushObstacle(x, y, s, 'green'),     50, 0.75, 1.25);
        //this._placeRandom((x, y, s) => this.addBushObstacle(x, y, s, 'autumn'),    40, 0.70, 1.15);
        //this._placeRandom((x, y, s) => this.addBushObstacle(x, y, s, 'thorn'),     30, 0.80, 1.20);

        this.player = this.physics.add.sprite(
            this.worldWidth / 2, this.worldHeight / 2, 'playerCircle'
        );
        this.player.setCircle(18, 4, 4);
        this.player.setCollideWorldBounds(true);
        this.player.setMaxVelocity(this.playerSpeed, this.playerSpeed);

        // "k" di smoothing: più alto = più reattivo, più basso = più morbido.
        // Usa delta-time, quindi resta consistente anche a FPS variabili.
        this.moveSmoothness = 18;

        this.physics.add.collider(this.player, this.rockSensors);
        this.physics.add.collider(this.player, this.bushSensors);

        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        this.keys = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.W,
            down:  Phaser.Input.Keyboard.KeyCodes.S,
            left:  Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.setDefaultCursor('crosshair');
        //quando clicco con il cursore da la posizione del cursore in coordinate world, non screen
        this.input.on('pointerdown', (pointer) => {
            const worldPoint = pointer.positionToCamera(this.cameras.main);
            console.log(`Cliccato in world: (${worldPoint.x.toFixed(2)}, ${worldPoint.y.toFixed(2)})`);
        });
    }

    update(_time, delta) {
        let dirX = 0, dirY = 0;
        if (this.keys.left.isDown  || this.cursors.left.isDown)  dirX -= 1;
        if (this.keys.right.isDown || this.cursors.right.isDown) dirX += 1;
        if (this.keys.up.isDown    || this.cursors.up.isDown)    dirY -= 1;
        if (this.keys.down.isDown  || this.cursors.down.isDown)  dirY += 1;

        let targetVX = 0;
        let targetVY = 0;

        if (dirX !== 0 || dirY !== 0) {
            const len = Math.hypot(dirX, dirY);
            targetVX = (dirX / len) * this.playerSpeed;
            targetVY = (dirY / len) * this.playerSpeed;
        }

        const dt = Math.min(delta, 100) / 1000; // clamp per evitare salti dopo tab-in/tab-out
        const alpha = 1 - Math.exp(-this.moveSmoothness * dt);

        const vx = this.player.body.velocity.x;
        const vy = this.player.body.velocity.y;

        this.player.setVelocity(
            Phaser.Math.Linear(vx, targetVX, alpha),
            Phaser.Math.Linear(vy, targetVY, alpha)
        );
    }
}

// ─────────────────────────────────────────────

const config = {
    type: Phaser.AUTO,
    width:  window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [BootScene]
};

let game = null;
function startGame() {
    if (game) game.destroy(true);
    game = new Phaser.Game(config);
    window.addEventListener('resize', () => game.scale.resize(window.innerWidth, window.innerHeight));
}
startGame();