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

import { socketFuncions } from "../WebSocketClient.js";
import { gameState } from "../gameState.js";

const ROCK_TYPES = {
  granite: {
    textureKey: "rock_granite",
    textureW: 100,
    textureH: 80,
    draw(g) {
      const body = [
        { x: 16, y: 63 },
        { x: 6, y: 39 },
        { x: 17, y: 18 },
        { x: 39, y: 5 },
        { x: 71, y: 9 },
        { x: 91, y: 27 },
        { x: 95, y: 53 },
        { x: 77, y: 71 },
        { x: 37, y: 76 },
      ];
      const highlight = [
        { x: 25, y: 29 },
        { x: 39, y: 12 },
        { x: 61, y: 16 },
        { x: 68, y: 31 },
        { x: 50, y: 45 },
        { x: 28, y: 43 },
      ];
      const shadow = [
        { x: 71, y: 9 },
        { x: 91, y: 27 },
        { x: 95, y: 53 },
        { x: 77, y: 71 },
        { x: 37, y: 76 },
        { x: 50, y: 45 },   
        { x: 66, y: 31 },       
        { x: 62, y: 17 },
         
      ];

      g.fillStyle(0x555961, 1);
      g.fillPoints(body, true);
      g.fillStyle(0x9ca2ad, 0.82);
      g.fillPoints(highlight, true);
      g.fillStyle(0x3b3e44, 0.8);
      g.fillPoints(shadow, true);

      g.fillStyle(0xb9bec9, 0.42);
      g.fillCircle(31, 26, 4);
      g.fillCircle(47, 16, 3);
      g.fillCircle(66, 21, 5);
      g.fillCircle(74, 34, 3);
      g.fillCircle(58, 45, 4);

      g.fillStyle(0x41444a, 0.55);
      g.fillCircle(22, 44, 3);
      g.fillCircle(35, 57, 2);
      g.fillCircle(51, 63, 3);
      g.fillCircle(79, 52, 2);
      g.fillCircle(86, 40, 3);

      g.lineStyle(1.6, 0x2f3136, 0.9);
      g.beginPath();
      g.moveTo(16, 63);
      g.lineTo(6, 39);
      g.lineTo(17, 18);
      g.lineTo(39, 5);
      g.lineTo(71, 9);
      g.lineTo(91, 27);
      g.lineTo(95, 53);
      g.lineTo(77, 71);
      g.lineTo(37, 76);
      g.lineTo(16, 63);
      g.strokePath();

      g.lineStyle(1, 0x474b52, 0.6);
      g.beginPath();
      g.moveTo(49, 18);
      g.lineTo(43, 35);
      g.lineTo(52, 50);
      g.strokePath();
      g.beginPath();
      g.moveTo(57, 26);
      g.lineTo(66, 36);
      g.lineTo(61, 49);
      g.strokePath();
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
    textureKey: "rock_sandstone",
    textureW: 90,
    textureH: 96,
    draw(g) {
      const body = [
        { x: 20, y: 88 },
        { x: 4, y: 56 },
        { x: 12, y: 28 },
        { x: 30, y: 8 },
        { x: 54, y: 2 },
        { x: 74, y: 16 },
        { x: 86, y: 44 },
        { x: 82, y: 74 },
        { x: 58, y: 92 },
      ];
      const highlight = [
        { x: 23, y: 40 },
        { x: 34, y: 12 },
        { x: 58, y: 10 },
        { x: 66, y: 34 },
        { x: 50, y: 52 },
        { x: 28, y: 48 },
      ];
      const shadow = [
        { x: 54, y: 2 },
        { x: 74, y: 16 },
        { x: 86, y: 44 },
        { x: 82, y: 74 },
        { x: 58, y: 92 },
        { x: 50, y: 52 },
        { x: 64, y: 33 },
        
      ];

      g.fillStyle(0x8e603e, 1);
      g.fillPoints(body, true);
      g.fillStyle(0xc78d61, 0.82);
      g.fillPoints(highlight, true);
      g.fillStyle(0x6c442b, 0.72);
      g.fillPoints(shadow, true);

      g.fillStyle(0xe7c39a, 0.24);
      g.fillCircle(24, 30, 4);
      g.fillCircle(39, 18, 3);
      g.fillCircle(52, 26, 5);
      g.fillCircle(61, 42, 3);
      g.fillCircle(45, 56, 4);

      g.fillStyle(0x7b4b2d, 0.45);
      g.fillCircle(18, 60, 3);
      g.fillCircle(29, 70, 2);
      g.fillCircle(43, 79, 3);
      g.fillCircle(67, 74, 2);
      g.fillCircle(76, 58, 3);
        
      g.lineStyle(1.4, 0x5b3420, 0.82);
      g.beginPath();
      g.moveTo(42, 16);
      g.lineTo(38, 38);
      g.lineTo(48, 52);
      g.strokePath();
      g.beginPath();
      g.moveTo(60, 28);
      g.lineTo(64, 48);
      g.strokePath();
      g.beginPath();
      g.moveTo(28, 58);
      g.lineTo(40, 66);
      g.lineTo(50, 82);
      g.strokePath();

      g.lineStyle(1, 0xd9b38a, 0.22);
      g.beginPath();
      g.moveTo(24, 38);
      g.lineTo(34, 22);
      g.lineTo(48, 18);
      g.strokePath();
    },
    sensorCircles: [
      { cx: 46, cy: 38, r: 32 },
      { cx: 47, cy: 52, r: 39 },
    ],
  },

  obsidian: {
    textureKey: "rock_obsidian",
    textureW: 120,
    textureH: 66,
    draw(g) {
      const body = [
        { x: 8, y: 52 },
        { x: 2, y: 32 },
        { x: 20, y: 12 },
        { x: 52, y: 4 },
        { x: 90, y: 8 },
        { x: 114, y: 24 },
        { x: 118, y: 46 },
        { x: 98, y: 60 },
        { x: 36, y: 62 },
      ];
      const facet = [
        { x: 18, y: 26 },
        { x: 40, y: 8 },
        { x: 82, y: 12 },
        { x: 92, y: 32 },
        { x: 62, y: 46 },
        { x: 24, y: 42 },
      ];
      const sheen = [
        { x: 30, y: 14 },
        { x: 52, y: 8 },
        { x: 66, y: 18 },
        { x: 52, y: 28 },
        { x: 34, y: 24 },
      ];
      const lowerFacet = [
        { x: 8, y: 52 },
        { x: 2, y: 32 },
        { x: 20, y: 12 },
        
        { x: 52, y: 4 },
        { x: 50, y: 8 },
        { x: 31, y: 13 },
        { x: 20, y: 27 },
        { x: 23, y: 42 },
        { x: 60, y: 46 },
        { x: 32, y: 61 },
        
      ];

      g.fillStyle(0x1f1f28, 1);
      g.fillPoints(body, true);
      g.fillStyle(0x47475c, 0.94);
      g.fillPoints(facet, true);
      g.fillStyle(0x8f90b0, 0.34);
      g.fillPoints(sheen, true);
      g.fillStyle(0x2f2f3d, 0.9);
      g.fillPoints(lowerFacet, true);

      g.fillStyle(0xb8bbd8, 0.12);
      g.fillCircle(44, 15, 4);
      g.fillCircle(58, 14, 3);
      g.fillCircle(71, 20, 2);
      g.fillCircle(79, 30, 3);

      g.lineStyle(1.4, 0x121219, 0.95);
      g.beginPath();
      g.moveTo(8, 52);
      g.lineTo(2, 32);
      g.lineTo(20, 12);
      g.lineTo(52, 4);
      g.lineTo(90, 8);
      g.lineTo(114, 24);
      g.lineTo(118, 46);
      g.lineTo(98, 60);
      g.lineTo(36, 62);
      g.lineTo(8, 52);
      g.strokePath();

      g.lineStyle(1.1, 0x7d7faa, 0.24);
      g.beginPath();
      g.moveTo(30, 14);
      g.lineTo(52, 8);
      g.lineTo(66, 18);
      g.lineTo(52, 28);
      g.strokePath();
      g.beginPath();
      g.moveTo(70, 14);
      g.lineTo(74, 36);
      g.lineTo(60, 46);
      g.strokePath();
    },
    sensorCircles: [
      { cx: 30, cy: 35, r: 24 },
      { cx: 92, cy: 36, r: 23 },
    ],
    sensorRects: [{ cx: 60, cy: 34, w: 55, h: 55 }],
  },
};

// ─────────────────────────────────────────────

const BUSH_TYPES = {
  green: {
    textureKey: "bush_green",
    textureW: 112,
    textureH: 100,
    sensorCircles: [
      { cx: 32, cy: 44, r: 24 },
      { cx: 60, cy: 38, r: 28 },
      { cx: 82, cy: 54, r: 24 },
      { cx: 56, cy: 64, r: 30 },
    ],
    draw(g) {
      g.fillStyle(0x2d7a2f, 1);
      g.fillCircle(32, 44, 24);
      g.fillCircle(60, 38, 28);
      g.fillCircle(82, 54, 24);
      g.fillCircle(56, 64, 30);
      g.fillStyle(0x47a34a, 0.9);
      g.fillCircle(42, 36, 10);
      g.fillCircle(72, 48, 12);
      g.fillStyle(0x1f5c21, 0.5);
      g.fillCircle(56, 72, 18);
    },
  },

  autumn: {
    textureKey: "bush_autumn",
    textureW: 112,
    textureH: 100,
    sensorCircles: [
      { cx: 32, cy: 44, r: 24 },
      { cx: 60, cy: 38, r: 28 },
      { cx: 82, cy: 54, r: 24 },
      { cx: 56, cy: 64, r: 30 },
    ],
    draw(g) {
      g.fillStyle(0xb54a1a, 1);
      g.fillCircle(32, 44, 24);
      g.fillCircle(60, 38, 28);
      g.fillCircle(82, 54, 24);
      g.fillCircle(56, 64, 30);
      g.fillStyle(0xe07030, 0.85);
      g.fillCircle(42, 36, 10);
      g.fillCircle(72, 48, 12);
      g.fillStyle(0x7a2c0a, 0.55);
      g.fillCircle(56, 72, 18);
    },
  },

  thorn: {
    textureKey: "bush_thorn",
    textureW: 112,
    textureH: 100,
    sensorCircles: [
      { cx: 32, cy: 44, r: 24 },
      { cx: 60, cy: 38, r: 28 },
      { cx: 82, cy: 54, r: 24 },
      { cx: 56, cy: 64, r: 30 },
    ],
    draw(g) {
      g.fillStyle(0x1e3d20, 1);
      g.fillCircle(32, 44, 24);
      g.fillCircle(60, 38, 28);
      g.fillCircle(82, 54, 24);
      g.fillCircle(56, 64, 30);
      g.fillStyle(0x2e5e30, 0.85);
      g.fillCircle(42, 36, 10);
      g.fillCircle(72, 48, 12);
      g.fillStyle(0x8b7355, 0.9);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const bx = 56 + Math.cos(a) * 36,
          by = 50 + Math.sin(a) * 30;
        g.fillTriangle(
          bx,
          by,
          bx + Math.cos(a + 0.4) * 6,
          by + Math.sin(a + 0.4) * 6,
          bx + Math.cos(a - 0.4) * 6,
          by + Math.sin(a - 0.4) * 6,
        );
      }
      g.fillStyle(0x111f12, 0.5);
      g.fillCircle(56, 72, 18);
    },
  },
};

// ─────────────────────────────────────────────
//  SCENE
// ─────────────────────────────────────────────

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
    this.worldWidth = 7680;
    this.worldHeight = 4320;
    this.playerSpeed = 320;
    this.remotePlayers = new Map();
    this.localUserId = localStorage.getItem("userId");
  }

  createGrassTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x4f8f3b, 1);
    g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 180; i++) {
      const x = Phaser.Math.Between(0, 127);
      const y = Phaser.Math.Between(0, 127);
      const color = Phaser.Math.RND.pick([
        0x5aa244, 0x6eb256, 0x427a31, 0x79bf5f,
      ]);
      g.fillStyle(color, Phaser.Math.FloatBetween(0.2, 0.45));
      g.fillCircle(x, y, Phaser.Math.Between(1, 3));
    }
    g.generateTexture("grassTile", 128, 128);
    g.destroy();
  }

  createObstacleTextures() {
    for (const def of Object.values(ROCK_TYPES)) {
      const g = this.add.graphics();
      def.draw(g);
      g.generateTexture(def.textureKey, def.textureW, def.textureH);
      g.destroy();
    }
    for (const def of Object.values(BUSH_TYPES)) {
      const g = this.add.graphics();
      def.draw(g);
      g.generateTexture(def.textureKey, def.textureW, def.textureH);
      g.destroy();
    }
  }

  createPlayerTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xb0b0b0, 1);
    g.fillCircle(22, 22, 20);
    g.lineStyle(2, 0x8e8e8e, 0.9);
    g.strokeCircle(22, 22, 20);
    g.generateTexture("playerCircle", 44, 44);
    g.destroy();
  }

  createSensorTexture() {
    // Evita che i sensori usino la texture di default (es. 32x32),
    // che sposta il body in base a displayOriginX/Y.
    if (this.textures.exists("sensorDot")) return;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 2, 2);
    g.generateTexture("sensorDot", 2, 2);
    g.destroy();
  }

  _getLocalPoint(gameObject, worldPoint) {
    const scaleX = gameObject.scaleX || 1;
    const scaleY = gameObject.scaleY || 1;
    const left = gameObject.x - gameObject.displayOriginX * scaleX;
    const top = gameObject.y - gameObject.displayOriginY * scaleY;

    return {
      x: (worldPoint.x - left) / scaleX,
      y: (worldPoint.y - top) / scaleY,
    };
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
    const s = group.create(wx, wy, "sensorDot");
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
    const s = group.create(wx, wy, "sensorDot");
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

        const cx =
          typeof rect.cx === "number" ? rect.cx : rect.x + rect.w * 0.5;
        const cy =
          typeof rect.cy === "number" ? rect.cy : rect.y + rect.h * 0.5;

        const wx = spriteX + (cx - hw) * scale;
        const wy = spriteY + (cy - hh) * scale;

        this._createRectSensor(group, wx, wy, w, h);
      }
    }
  }

  // ── Factories ────────────────────────────

  addRockObstacle(x, y, scale = 1, type = "granite") {
    const def = ROCK_TYPES[type] ?? ROCK_TYPES.granite;
    const rock = this.obstacles.create(x, y, def.textureKey);
    rock.setScale(scale);
    rock.setInteractive({ pixelPerfect: true, alphaTolerance: 1 });
    rock.setImmovable(true);
    rock.body.moves = false;
    rock.body.setSize(1, 1);
    this._spawnSensors(this.rockSensors, def, x, y, scale);
    return rock;
  }

  addBushObstacle(x, y, scale = 1, type = "green") {
    const def = BUSH_TYPES[type] ?? BUSH_TYPES.green;
    const bush = this.obstacles.create(x, y, def.textureKey);
    bush.setScale(scale);
    bush.setInteractive({ pixelPerfect: true, alphaTolerance: 1 });
    bush.setImmovable(true);
    bush.body.moves = false;
    bush.body.setSize(1, 1);
    this._spawnSensors(this.bushSensors, def, x, y, scale);
    return bush;
  }

  addObstacle(x, y, obstacle = "rock", type, scale = 1) {
    if (obstacle === "rock") return this.addRockObstacle(x, y, scale, type);
    if (obstacle === "bush") return this.addBushObstacle(x, y, scale, type);
  }

  _placeRandom(fn, count, minScale, maxScale) {
    for (let i = 0; i < count; i++) {
      fn(
        Phaser.Math.Between(150, this.worldWidth - 150),
        Phaser.Math.Between(150, this.worldHeight - 150),
        Phaser.Math.FloatBetween(minScale, maxScale),
      );
    }
  }

  _spawnObstaclesFromServer(obstacles) {
    if (!Array.isArray(obstacles)) return;

    obstacles.forEach((obstacle) => {
      if (!obstacle || typeof obstacle.x !== "number" || typeof obstacle.y !== "number") {
        return;
      }

      this.addObstacle(
        obstacle.x,
        obstacle.y,
        obstacle.obstacle || "rock",
        obstacle.type,
        obstacle.scale || 1,
      );
    });
  }

  create() {
    const currentGame = gameState.currentGame || {};

    this.worldWidth = currentGame.worldWidth || this.worldWidth;
    this.worldHeight = currentGame.worldHeight || this.worldHeight;
    this.playerSpeed = currentGame.playerSpeed || this.playerSpeed;

    this.createGrassTexture();
    this.createObstacleTextures();
    this.createPlayerTexture();
    this.createSensorTexture();

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.add.tileSprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      "grassTile",
    );

    this.obstacles = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.rockSensors = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.bushSensors = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this._spawnObstaclesFromServer(currentGame.obstacles);

    if (!Array.isArray(currentGame.obstacles) || currentGame.obstacles.length === 0) {
      this.addRockObstacle(3738, 2160, 1.1, "obsidian");
      this.addRockObstacle(3738, 2300, 1.1, "granite");
      this.addRockObstacle(3738, 2450, 1.1, "sandstone");
      this.addBushObstacle(4047, 2160, 1.1, "green");
      this.addBushObstacle(4047, 2300, 1.1, "autumn");
      this.addBushObstacle(4047, 2450, 1.1, "thorn");
    }

    this.player = this.physics.add.sprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      "playerCircle",
    );
    this.player.setCircle(18, 4, 4);
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(this.playerSpeed, this.playerSpeed);

    this.physics.add.collider(this.player, this.rockSensors);
    this.physics.add.collider(this.player, this.bushSensors);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    if (Array.isArray(currentGame.players)) {
      this.syncPlayersFromServer(currentGame.players);
    }
    const inputKeys = ["W", "A", "S", "D", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    //aggiunti l'emit al server quando si premono i tasti
    this.input.keyboard.on("keydown", (event) => {
      if (inputKeys.includes(event.key.toUpperCase())) {
        socketFuncions.emitPlayerInput(event.key.toUpperCase(), true);
      }
    });
    this.input.keyboard.on("keyup", (event) => {
      if (inputKeys.includes(event.key.toUpperCase())) {
        socketFuncions.emitPlayerInput(event.key.toUpperCase(), false);
      }
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.setDefaultCursor("crosshair");
    // Quando clicco con il cursore ottengo sia la posizione world sia,
    // se sto toccando un oggetto, le coordinate locali sulla sua texture.
    this.input.on("pointerdown", (pointer) => {
      const worldPoint = pointer.positionToCamera(this.cameras.main);
      console.log(
        `Cliccato in world: (${worldPoint.x.toFixed(2)}, ${worldPoint.y.toFixed(2)})`,
      );
    });

    this.input.on("gameobjectdown", (pointer, gameObject) => {
      const worldPoint = pointer.positionToCamera(this.cameras.main);
      const localPoint = this._getLocalPoint(gameObject, worldPoint);
      console.log(
        `Oggetto toccato: ${gameObject.texture.key} | locale: (${localPoint.x.toFixed(2)}, ${localPoint.y.toFixed(2)})`,
      );
    });

    // Testo debug FPS (rimane fisso a schermo)
    this.fpsText = this.add.text(10, 10, "FPS: 0", {
      fontSize: "16px",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 4, y: 4 },
    });
    this.fpsText.setScrollFactor(0); // non segue la camera
    this.fpsText.setDepth(1000); // sopra agli altri elementi
    this.positionText = this.add.text(10, 40, "Posizione: 0, 0", {
      fontSize: "16px",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 4, y: 4 },
    });
    this.positionText.setScrollFactor(0); // non segue la camera
    this.positionText.setDepth(1000); // sopra agli altri elementi
  }

  syncPlayersFromServer(playersPayload) {
    if (!Array.isArray(playersPayload)) return;

    const seenPlayers = new Set();

    playersPayload.forEach((playerData) => {
      if (!playerData || !playerData.userId) return;
      seenPlayers.add(playerData.userId);

      if (playerData.userId === this.localUserId) {
        if (this.player?.body) {
          this.player.body.reset(playerData.x, playerData.y);
        } else if (this.player) {
          this.player.setPosition(playerData.x, playerData.y);
        }
        return;
      }

      let remotePlayer = this.remotePlayers.get(playerData.userId);
      if (!remotePlayer) {
        remotePlayer = this.add.sprite(playerData.x, playerData.y, "playerCircle");
        remotePlayer.setDepth(10);
        remotePlayer.setTint(0x7cc7ff);
        this.remotePlayers.set(playerData.userId, remotePlayer);
      }

      remotePlayer.setPosition(playerData.x, playerData.y);
    });

    for (const [userId, remotePlayer] of this.remotePlayers.entries()) {
      if (!seenPlayers.has(userId)) {
        remotePlayer.destroy();
        this.remotePlayers.delete(userId);
      }
    }
  }

  update(_time, delta) {
    // Il movimento è autoritativo lato server: qui resta solo il debug.
    this.fpsText.setText(`FPS: ${this.game.loop.actualFps.toFixed(1)}`);
    this.positionText.setText(`Posizione: ${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)}`);
  }
}

