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

const abilityKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Q"];

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
const DEFAULT_ABILITYES = [
  {
    name: "Dash",
    key: "Q",
    cooldown: 3,
    duration: 0.3,
    effect: (_payload, scene) => {
      if (!scene?.player) return;
      scene.player.speedPercentage = 2.5;
      setTimeout(() => {
        if (scene?.player) scene.player.speedPercentage = 1;
      }, 300);
    },
  },
];

const ABILITIES = [
  {
    name: "Granitè blast",
    type: "ray",
    radius: 100,
    damage: 100,
    range: 2000,
    cooldown: 10,
    colors: ["#D5F2F8", "#61EBF5", "#4AFAFA"],
    effect: (player, room) => {
      
    }
  },
];

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
    this.lastSentDirection = null;
    this.lastSentX = null;
    this.lastSentY = null;
    this.lastTransformSentAt = 0;
    this.localSpawnSynced = false;
    this.localPlayerState = {
      hp: 100,
      energy: 100,
      points: 0,
    };
    this.localPlayerAbilities = new Map();
    this.pendingAudioLoads = new Set();
    this.hud = null;
  }

  getHotbarAbilities(currentGame) {
    const defaultAbilityKeys = new Set(
      DEFAULT_ABILITYES
        .map((ability) => String(ability?.key || "").toUpperCase())
        .filter(Boolean),
    );

    const requestedCount =
      currentGame.abilities?.length ||
      currentGame.nAbilities ||
      currentGame.abilityList?.length ||
      0;
    const nAbilities = Number.isFinite(requestedCount)
      ? Math.max(1, Math.min(10, Math.floor(requestedCount)))
      : 4;

    const sourceAbilities =
      (Array.isArray(currentGame?.abilities) && currentGame.abilities) ||
      (Array.isArray(currentGame?.abilityList) && currentGame.abilityList) ||
      [];

    const visibleSourceAbilities = sourceAbilities.filter((ability, index) => {
      const explicitKey = ability?.key
        ? String(ability.key).toUpperCase()
        : String(index + 1);
      return !defaultAbilityKeys.has(explicitKey);
    });

    const abilities = [];
    for (let i = 0; i < nAbilities; i++) {
      const source = visibleSourceAbilities[i];
      const sourceName =
        typeof source === "string"
          ? source
          : typeof source?.name === "string"
            ? source.name
            : null;
      abilities.push({
        name: sourceName || `Abilita ${i + 1}`,
      });
    }
    return abilities;
  }

  _buildKeyedAbilityMap(currentGame) {
    const keyedAbilities = new Map();

    DEFAULT_ABILITYES.forEach((ability) => {
      if (ability?.key) {
        keyedAbilities.set(String(ability.key).toUpperCase(), ability);
      }
    });

    const gameAbilities = Array.isArray(currentGame?.abilities)
      ? currentGame.abilities
      : [];
    gameAbilities.forEach((ability, index) => {
      if (!ability) return;
      const explicitKey = ability.key
        ? String(ability.key).toUpperCase()
        : null;
      if (explicitKey) {
        keyedAbilities.set(explicitKey, ability);
      }
      const numericKey = String(index + 1);
      if (!keyedAbilities.has(numericKey)) {
        keyedAbilities.set(numericKey, ability);
      }
    });

    ABILITIES.forEach((ability, index) => {
      const explicitKey = ability?.key
        ? String(ability.key).toUpperCase()
        : null;
      if (explicitKey) {
        keyedAbilities.set(explicitKey, ability);
      }
      const numericKey = String(index + 1);
      if (!keyedAbilities.has(numericKey)) {
        keyedAbilities.set(numericKey, ability);
      }
    });

    return keyedAbilities;
  }

  updateAbilities(abilitiesIndex) {
    const currentGame = gameState.currentGame;
    if (!currentGame || !Array.isArray(abilitiesIndex)) return;

    const defaultAbilityKeys = new Set(
      DEFAULT_ABILITYES
        .map((ability) => String(ability?.key || "").toUpperCase())
        .filter(Boolean),
    );

    if (!(this.localPlayerAbilities instanceof Map)) {
      this.localPlayerAbilities = new Map();
    } else {
      this.localPlayerAbilities.clear();
    }

    if (
      !currentGame.localPlayer ||
      typeof currentGame.localPlayer !== "object"
    ) {
      currentGame.localPlayer = {};
    }
    currentGame.localPlayer.abilities = {};

    const keyedAbilities = this._buildKeyedAbilityMap(currentGame);

    let visibleSlotIndex = 0;
    abilitiesIndex.forEach((abilityKey) => {
      const normalizedKey = String(abilityKey).toUpperCase();
      const abilityData = keyedAbilities.get(normalizedKey);
      if (abilityData) {
        this.localPlayerAbilities.set(normalizedKey, abilityData);
        currentGame.localPlayer.abilities[normalizedKey] = abilityData;
      }

      if (defaultAbilityKeys.has(normalizedKey)) {
        return;
      }

      if (abilityData && this.hud && this.hud.slots[visibleSlotIndex]) {
        const slot = this.hud.slots[visibleSlotIndex];
        slot.nameText.setText(abilityData.name);
        this.tryAttachAbilityIcon(abilityData.name, slot.icon);
      }
      visibleSlotIndex += 1;
    });
  }

  _hexColorToNumber(colorValue, fallback = 0xffffff) {
    if (typeof colorValue === "number" && Number.isFinite(colorValue)) {
      return colorValue;
    }
    if (typeof colorValue !== "string") return fallback;
    const normalized = colorValue.trim().replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return fallback;
    return parseInt(normalized, 16);
  }

  _abilityNameToAudioCandidates(abilityName) {
    const raw = String(abilityName || "").trim();
    if (!raw) return [];

    const words = raw.split(/\s+/).filter(Boolean);
    const camel = words
      .map((w, i) => {
        if (i === 0) return w.charAt(0).toLowerCase() + w.slice(1);
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join("");

    const underscored = raw
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_\-]/gi, "");

    const compact = raw
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9_\-]/gi, "");

    const noDiacriticsCamel = words
      .map((w, i) => {
        const norm = w
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        if (i === 0) return norm.charAt(0).toLowerCase() + norm.slice(1);
        return norm.charAt(0).toUpperCase() + norm.slice(1);
      })
      .join("");

    return Array.from(
      new Set([raw, camel, underscored, compact, noDiacriticsCamel].filter(Boolean)),
    );
  }

  _playAudioByBaseName(baseName, volume) {
    const safeVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (safeVolume <= 0.02) return;

    const candidates = this._abilityNameToAudioCandidates(baseName);
    if (candidates.length === 0) return;

    const tryPlayCandidate = (idx) => {
      if (idx >= candidates.length) return;
      const candidate = candidates[idx];
      const audioKey = `abilitySfx_${candidate}`;

      if (this.cache.audio.exists(audioKey)) {
        this.sound.play(audioKey, { volume: safeVolume });
        return;
      }

      if (this.pendingAudioLoads.has(audioKey)) {
        this.time.delayedCall(80, () => tryPlayCandidate(idx));
        return;
      }

      this.pendingAudioLoads.add(audioKey);
      this.load.audio(audioKey, `assets/sounds/${candidate}.mp3`);
      this.load.once(`filecomplete-audio-${audioKey}`, () => {
        this.pendingAudioLoads.delete(audioKey);
        if (this.cache.audio.exists(audioKey)) {
          this.sound.play(audioKey, { volume: safeVolume });
        }
      });
      this.load.once(`loaderror`, () => {
        this.pendingAudioLoads.delete(audioKey);
        tryPlayCandidate(idx + 1);
      });
      this.load.start();
    };

    tryPlayCandidate(0);
  }

  _playAbilityFxSounds(effectPayload) {
    if (!effectPayload) return;

    const originX = Number(effectPayload.x);
    const originY = Number(effectPayload.y);
    if (!Number.isFinite(originX) || !Number.isFinite(originY)) return;

    const listenerX = Number.isFinite(this.player?.x) ? this.player.x : originX;
    const listenerY = Number.isFinite(this.player?.y) ? this.player.y : originY;
    const distance = Phaser.Math.Distance.Between(listenerX, listenerY, originX, originY);
    const hearDistance = Math.max(500, Number(effectPayload.hearDistance) || 2600);
    const distanceVolume = Phaser.Math.Clamp(1 - distance / hearDistance, 0, 1);

    const audioClips = Array.isArray(effectPayload.audioClips)
      ? effectPayload.audioClips
      : this._abilityNameToAudioCandidates(effectPayload.abilityName);
    audioClips.forEach((clipName) => {
      this._playAudioByBaseName(clipName, distanceVolume);
    });

    const isAttacker = effectPayload.ownerId === this.localUserId;
    if (isAttacker && Array.isArray(effectPayload.attackerAudioClips)) {
      effectPayload.attackerAudioClips.forEach((clipName) => {
        this._playAudioByBaseName(clipName, 1);
      });
    }
  }

  _playRayCapsuleFx(effectPayload) {
    if (!effectPayload || effectPayload.type !== "ray-capsule") return;

    const startX = Number(effectPayload.x);
    const startY = Number(effectPayload.y);
    const direction = Number.isFinite(effectPayload.direction)
      ? effectPayload.direction
      : 0;
    const range = Number.isFinite(effectPayload.range) ? effectPayload.range : 1200;
    const radius = Number.isFinite(effectPayload.radius) ? effectPayload.radius : 100;
    const durationMs = Math.max(
      60,
      Math.floor((Number(effectPayload.duration) || 0.2) * 1000),
    );
    const colors = Array.isArray(effectPayload.colors)
      ? effectPayload.colors
      : ["#ffffff", "#cccccc", "#888888"];

    const endX = startX + Math.cos(direction) * range;
    const endY = startY + Math.sin(direction) * range;

    const g = this.add.graphics();
    g.setDepth(1100);

    const drawAtProgress = (progress) => {
      if (!g || !g.active) return;
      g.clear();

      const p = Phaser.Math.Clamp(progress, 0, 1);
      const currentLen = range * (0.2 + 0.8 * p);
      const tipX = startX + Math.cos(direction) * currentLen;
      const tipY = startY + Math.sin(direction) * currentLen;
      const fade = 1 - p;
      const widthPulse = 0.92 + 0.08 * Math.sin(this.time.now * 0.045);

      const colorCount = Math.max(1, colors.length);
      for (let layer = colorCount - 1; layer >= 0; layer--) {
        const color = this._hexColorToNumber(colors[layer], 0xffffff);
        const t = (layer + 1) / colorCount;
        const width = Math.max(2, radius * 2 * t * widthPulse);
        const alpha = (0.1 + 0.3 * t) * fade;

        g.lineStyle(width, color, alpha);
        g.beginPath();
        g.moveTo(startX, startY);
        g.lineTo(tipX, tipY);
        g.strokePath();

        g.fillStyle(color, alpha * 0.95);
        g.fillCircle(startX, startY, width * 0.5);
        g.fillCircle(tipX, tipY, width * 0.5);
      }
    };

    drawAtProgress(0);
    this._playAbilityFxSounds(effectPayload);

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: durationMs,
      ease: "Sine.Out",
      onUpdate: (tween) => {
        drawAtProgress(tween.getValue());
      },
      onComplete: () => {
        if (g && g.active) g.destroy();
      },
    });
  }

  _resolveAbilityForEffect(effectPayload) {
    if (!effectPayload) return null;
    const effectKey = effectPayload.abilityKey
      ? String(effectPayload.abilityKey).toUpperCase()
      : null;

    if (effectKey && this.localPlayerAbilities.has(effectKey)) {
      return this.localPlayerAbilities.get(effectKey);
    }

    const currentGame = gameState.currentGame;
    const keyedAbilities = this._buildKeyedAbilityMap(currentGame || {});
    if (effectKey && keyedAbilities.has(effectKey)) {
      return keyedAbilities.get(effectKey);
    }

    return null;
  }

  playAbilityFx(effectPayload) {
    if (!effectPayload || typeof effectPayload !== "object") return;

    const ability = this._resolveAbilityForEffect(effectPayload);
    if (ability && typeof ability.effect === "function") {
      const handledByCustomEffect = ability.effect(effectPayload, this);
      if (handledByCustomEffect === true) {
        return;
      }
    }

    if (effectPayload.type === "ray-capsule") {
      this._playRayCapsuleFx(effectPayload);
    }
  }

  drawBar(graphics, x, y, width, height, ratio, fillColor) {
    const safeRatio = Math.max(0, Math.min(1, ratio));
    graphics.clear();
    graphics.fillStyle(0x0f1115, 0.82);
    graphics.fillRoundedRect(x, y, width, height, 8);
    graphics.fillStyle(fillColor, 0.95);
    graphics.fillRoundedRect(
      x + 2,
      y + 2,
      (width - 4) * safeRatio,
      height - 4,
      6,
    );
    graphics.lineStyle(2, 0xffffff, 0.18);
    graphics.strokeRoundedRect(x, y, width, height, 8);
  }

  tryAttachAbilityIcon(abilityName, iconSprite) {
    if (!abilityName || !iconSprite) return;
    const safeBaseName = String(abilityName)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_\-]/g, "");
    if (!safeBaseName) return;

    const textureKey = `${safeBaseName}_hotbarSprite`;
    if (this.textures.exists(textureKey)) {
      iconSprite.setTexture(textureKey);
      return;
    }

    this.load.image(
      textureKey,
      `assets/images/${safeBaseName}_hotbarSprite.png`,
    );
    this.load.once(`filecomplete-image-${textureKey}`, () => {
      if (iconSprite && iconSprite.active) {
        iconSprite.setTexture(textureKey);
      }
    });
    this.load.start();
  }

  createGameHud(currentGame) {
    const width = this.scale.width;
    const height = this.scale.height;
    const abilities = this.getHotbarAbilities(currentGame);

    const slotCount = Math.max(1, abilities.length);
    const horizontalPadding = Math.max(12, Math.floor(width * 0.02));
    const slotGap = width < 900 ? 6 : 10;
    const maxSlotByWidth = Math.floor(
      (width - horizontalPadding * 2 - (slotCount - 1) * slotGap) / slotCount,
    );
    const slotSize = Math.max(24, Math.min(92, maxSlotByWidth));
    const hotbarWidth = slotCount * slotSize + (slotCount - 1) * slotGap;
    const hotbarX = Math.floor((width - hotbarWidth) * 0.5);
    const hotbarY = height - slotSize - 24;

    const hud = {
      slots: [],
      hpBar: this.add.graphics(),
      energyBar: this.add.graphics(),
      hpLabel: this.add.text(0, 0, "", {
        fontSize: "16px",
        fontStyle: "700",
        color: "#ffd6d6",
      }),
      energyLabel: this.add.text(0, 0, "", {
        fontSize: "16px",
        fontStyle: "700",
        color: "#d8f5ff",
      }),
      pointsText: this.add
        .text(width * 0.5, hotbarY - 56, "Punti: 0", {
          fontSize: "18px",
          fontStyle: "700",
          color: "#fff1b0",
        })
        .setOrigin(0.5, 0.5),
    };

    abilities.forEach((ability, index) => {
      const x = hotbarX + index * (slotSize + slotGap);
      const bg = this.add
        .rectangle(x, hotbarY, slotSize, slotSize, 0x12171f, 0.9)
        .setOrigin(0, 0);
      bg.setStrokeStyle(2, 0xffffff, 0.2);

      const icon = this.add
        .image(x + slotSize * 0.5, hotbarY + slotSize * 0.42, "sensorDot")
        .setDisplaySize(slotSize * 0.55, slotSize * 0.55)
        .setAlpha(0.95);

      const nameText = this.add
        .text(x + slotSize * 0.5, hotbarY + slotSize - 8, ability.name, {
          fontSize: `${Math.max(9, Math.min(12, Math.floor(slotSize * 0.18)))}px`,
          color: "#f5f7ff",
          align: "center",
          wordWrap: { width: slotSize - 8 },
        })
        .setOrigin(0.5, 1);

      this.tryAttachAbilityIcon(ability.name, icon);
      hud.slots.push({ bg, icon, nameText });
    });

    const barsY = hotbarY - 36;
    const barWidth = Math.min(280, Math.max(170, Math.floor(width * 0.28)));
    const barHeight = 22;
    const barGapFromCenter = 26;

    const hpX = width * 0.5 - barGapFromCenter - barWidth;
    const energyX = width * 0.5 + barGapFromCenter;

    hud.hpLayout = { x: hpX, y: barsY, width: barWidth, height: barHeight };
    hud.energyLayout = {
      x: energyX,
      y: barsY,
      width: barWidth,
      height: barHeight,
    };

    hud.hpLabel.setPosition(hpX, barsY - 18);
    hud.energyLabel.setPosition(energyX, barsY - 18);

    const toPin = [
      hud.hpBar,
      hud.energyBar,
      hud.hpLabel,
      hud.energyLabel,
      hud.pointsText,
    ];
    hud.slots.forEach((slot) => {
      toPin.push(slot.bg, slot.icon, slot.nameText);
    });

    toPin.forEach((obj) => {
      obj.setScrollFactor(0);
      obj.setDepth(1200);
    });

    this.hud = hud;
    this.updateHudValues();
  }

  updateHudValues() {
    if (!this.hud) return;

    const hp = Number.isFinite(this.localPlayerState?.hp)
      ? this.localPlayerState.hp
      : 0;
    const energy = Number.isFinite(this.localPlayerState?.energy)
      ? this.localPlayerState.energy
      : 0;
    const points = Number.isFinite(this.localPlayerState?.points)
      ? this.localPlayerState.points
      : 0;

    const hpMax = 100;
    const energyMax = 100;
    this.drawBar(
      this.hud.hpBar,
      this.hud.hpLayout.x,
      this.hud.hpLayout.y,
      this.hud.hpLayout.width,
      this.hud.hpLayout.height,
      hp / hpMax,
      0xd15252,
    );
    this.drawBar(
      this.hud.energyBar,
      this.hud.energyLayout.x,
      this.hud.energyLayout.y,
      this.hud.energyLayout.width,
      this.hud.energyLayout.height,
      energy / energyMax,
      0x49b8e8,
    );

    this.hud.hpLabel.setText(`Vita ${Math.max(0, Math.round(hp))}/${hpMax}`);
    this.hud.energyLabel.setText(
      `Energia ${Math.max(0, Math.round(energy))}/${energyMax}`,
    );
    this.hud.pointsText.setText(`Punti: ${Math.max(0, Math.round(points))}`);
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
      if (
        !obstacle ||
        typeof obstacle.x !== "number" ||
        typeof obstacle.y !== "number"
      ) {
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

    if (
      !Array.isArray(currentGame.obstacles) ||
      currentGame.obstacles.length === 0
    ) {
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
    this.player.setDrag(900, 900);
    this.player.setDamping(true);

    this.physics.add.collider(this.player, this.rockSensors);
    this.physics.add.collider(this.player, this.bushSensors);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    if (Array.isArray(currentGame.players)) {
      this.syncPlayersFromServer(currentGame.players);
    }
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
      downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
      leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    });
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    ]);
    // Le abilita restano server-side: inviamo solo key + stato premuto/rilasciato.
    this.input.keyboard.on("keydown", (event) => {
      const key = event.key.toUpperCase();
      if (!abilityKeys.includes(key)) return;

      // Se abbiamo gia ricevuto la lista abilita dal server, ignora tasti non assegnati.
      if (
        this.localPlayerAbilities instanceof Map &&
        this.localPlayerAbilities.size > 0
      ) {
        if (!this.localPlayerAbilities.has(key)) return;
      }

      socketFuncions.emitAbilityInput(key);
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

    this.createGameHud(currentGame);
  }

  syncPlayersFromServer(playersPayload) {
    if (!Array.isArray(playersPayload)) return;

    const seenPlayers = new Set();

    playersPayload.forEach((playerData) => {
      if (!playerData || !playerData.userId) return;
      seenPlayers.add(playerData.userId);

      if (playerData.userId === this.localUserId) {
        this.localPlayerState = {
          hp: Number.isFinite(playerData.hp)
            ? playerData.hp
            : this.localPlayerState.hp,
          energy: Number.isFinite(playerData.energy)
            ? playerData.energy
            : this.localPlayerState.energy,
          points: Number.isFinite(playerData.points)
            ? playerData.points
            : Number.isFinite(playerData?.attributes?.domainPoints)
              ? playerData.attributes.domainPoints
              : this.localPlayerState.points,
        };
        if (!this.localSpawnSynced) {
          if (this.player?.body) {
            this.player.body.reset(playerData.x, playerData.y);
          } else if (this.player) {
            this.player.setPosition(playerData.x, playerData.y);
          }
          this.localSpawnSynced = true;
        }
        if (typeof playerData.direction === "number") {
          this.player.rotation = playerData.direction;
        }
        return;
      }

      let remotePlayer = this.remotePlayers.get(playerData.userId);
      if (!remotePlayer) {
        remotePlayer = this.add.sprite(
          playerData.x,
          playerData.y,
          "playerCircle",
        );
        remotePlayer.setDepth(10);
        remotePlayer.setTint(0x7cc7ff);
        this.remotePlayers.set(playerData.userId, remotePlayer);
      }

      remotePlayer.setPosition(playerData.x, playerData.y);
      if (typeof playerData.direction === "number") {
        remotePlayer.rotation = playerData.direction;
      }
    });

    for (const [userId, remotePlayer] of this.remotePlayers.entries()) {
      if (!seenPlayers.has(userId)) {
        remotePlayer.destroy();
        this.remotePlayers.delete(userId);
      }
    }
  }

  update(_time, delta) {
    let dirX = 0;
    let dirY = 0;

    if (this.keys.left?.isDown || this.keys.leftArrow?.isDown) dirX -= 1;
    if (this.keys.right?.isDown || this.keys.rightArrow?.isDown) dirX += 1;
    if (this.keys.up?.isDown || this.keys.upArrow?.isDown) dirY -= 1;
    if (this.keys.down?.isDown || this.keys.downArrow?.isDown) dirY += 1;

    if (dirX !== 0 || dirY !== 0) {
      const length = Math.hypot(dirX, dirY);
      this.player.body.setVelocity(
        (dirX / length) * this.playerSpeed,
        (dirY / length) * this.playerSpeed,
      );
    } else {
      this.player.body.setVelocity(0, 0);
    }

    const pointer = this.input.activePointer;
    if (this.player && pointer) {
      const worldPoint = pointer.positionToCamera(this.cameras.main);
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        worldPoint.x,
        worldPoint.y,
      );
      const threshold = Phaser.Math.DegToRad(4);
      const angleDelta =
        this.lastSentDirection === null
          ? Infinity
          : Math.abs(Phaser.Math.Angle.Wrap(angle - this.lastSentDirection));

      this.player.rotation = angle;

      const distanceSinceLastSend =
        this.lastSentX === null || this.lastSentY === null
          ? Infinity
          : Phaser.Math.Distance.Between(
              this.player.x,
              this.player.y,
              this.lastSentX,
              this.lastSentY,
            );

      const movedEnough = distanceSinceLastSend >= 4;
      const rotatedEnough = angleDelta >= threshold;
      const timeElapsed = _time - this.lastTransformSentAt >= 50;

      if (movedEnough || rotatedEnough || timeElapsed) {
        this.lastSentDirection = angle;
        this.lastSentX = this.player.x;
        this.lastSentY = this.player.y;
        this.lastTransformSentAt = _time;
        socketFuncions.emitPlayerTransform({
          x: this.player.x,
          y: this.player.y,
          direction: angle,
          delta,
        });
      }
    }
    this.fpsText.setText(`FPS: ${this.game.loop.actualFps.toFixed(1)}`);
    this.positionText.setText(
      `Posizione: ${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)}`,
    );
    this.updateHudValues();
  }
}
