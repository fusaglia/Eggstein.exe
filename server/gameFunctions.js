import { re } from "mathjs";
import { getScoket } from "./server.js";

const WORLD_WIDTH = 7680;
const WORLD_HEIGHT = 4320;
const PLAYER_SPEED = 320;
const MOVE_SMOOTHNESS = 18;
const test = true;
const validAbilityKeys = new Set([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "Q",
  "E",
]);

const DEFAULT_ABILITYES =[{
  name: "dash",
  key: "Q",
  cooldown: 3,
  duration: 0.3,
  activeCooldown: false,
  effect: (player) => {
    player.invulnerable = true;
    player.speedPercentage = 2.5;
    setTimeout(() => {
      player.invulnerable = false;
      player.speedPercentage = 1;
    }, 300);
  },
}]

const ABILITIES = [{
  name: "Granitè blast",
  type: "ray",
  radius: 100,
  damage: 100,
  range: 2000,
  cooldown: 10,
  duration: 0.2,
  soundEffects: ["granitèBlast"],
  attackerSoundEffects: [],
  effect: (player, room) => {
    //questa abilità è un ray istantaneo che parte dal player e si espante nella direzione in cui sta guardando, se colpisce un altro player, gli fa danno e lo spinge indietro
  },
}]

function createSeededRandom(seedValue) {
  let seed = 0;
  const seedText = String(seedValue ?? "0");
  for (let i = 0; i < seedText.length; i++) {
    seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  if (seed === 0) seed = 0x6d2b79f5;

  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

function randomBetween(rng, min, max) {
  return min + (max - min) * rng();
}

function buildWorldObstacles(seed) {
  const rng = createSeededRandom(seed);
  const specs = [
    {
      obstacle: "rock",
      type: "granite",
      count: 14,
      minScale: 0.8,
      maxScale: 1.35,
    },
    {
      obstacle: "rock",
      type: "sandstone",
      count: 12,
      minScale: 0.7,
      maxScale: 1.2,
    },
    {
      obstacle: "rock",
      type: "obsidian",
      count: 10,
      minScale: 0.9,
      maxScale: 1.4,
    },
    {
      obstacle: "bush",
      type: "green",
      count: 16,
      minScale: 0.75,
      maxScale: 1.25,
    },
    {
      obstacle: "bush",
      type: "autumn",
      count: 12,
      minScale: 0.7,
      maxScale: 1.15,
    },
    {
      obstacle: "bush",
      type: "thorn",
      count: 10,
      minScale: 0.8,
      maxScale: 1.2,
    },
  ];

  const obstacles = [];
  specs.forEach((spec) => {
    for (let i = 0; i < spec.count; i++) {
      obstacles.push({
        obstacle: spec.obstacle,
        type: spec.type,
        x: Math.floor(randomBetween(rng, 220, WORLD_WIDTH - 220)),
        y: Math.floor(randomBetween(rng, 220, WORLD_HEIGHT - 220)),
        scale: Number(
          randomBetween(rng, spec.minScale, spec.maxScale).toFixed(2),
        ),
      });
    }
  });

  return obstacles;
}

function randomSpawnPosition() {
  return {
    x: Math.floor(200 + Math.random() * (WORLD_WIDTH - 400)),
    y: Math.floor(200 + Math.random() * (WORLD_HEIGHT - 400)),
  };
}

function createAbilityInstance(ability) {
  if (!ability || typeof ability !== "object") return null;
  return {
    ...ability,
    activeCooldown: false,
    lastUsedAt: 0,
  };
}

function distancePointToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq <= 0.000001) {
    return Math.hypot(px - ax, py - ay);
  }
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  return Math.hypot(px - cx, py - cy);
}

function computeCapsuleRayHits(shooter, room, ability) {
  if (!shooter || !room || !room.game || !room.game.players) return [];
  const dir = Number.isFinite(shooter.direction) ? shooter.direction : 0;
  const startX = shooter.x;
  const startY = shooter.y;
  const range = Number.isFinite(ability?.range) ? ability.range : 2000;
  const radius = Number.isFinite(ability?.radius) ? ability.radius : 100;
  const endX = startX + Math.cos(dir) * range;
  const endY = startY + Math.sin(dir) * range;
  const hits = [];
  const targetRadius = 18;

  room.game.players.forEach((target) => {
    if (!target || target.userId === shooter.userId) return;
    if (target.attributes?.invulnerable) return;

    const distToCenterLine = distancePointToSegment(
      target.x,
      target.y,
      startX,
      startY,
      endX,
      endY,
    );
    const edgeDistance = Math.max(0, distToCenterLine - targetRadius);
    if (edgeDistance > radius) return;

    const normalized = 1 - edgeDistance / radius;
    const damage = Math.round(40 + normalized * (100 - 40));
    const knockback = 240 + normalized * 280;

    hits.push({ target, damage, knockback });
  });

  return {
    hits,
    effect: {
      abilityKey: ability?.key || "1",
      abilityName: ability?.name || "",
      type: "ray-capsule",
      x: startX,
      y: startY,
      direction: dir,
      range,
      radius,
      duration: Number.isFinite(ability?.duration) ? ability.duration : 0.2,
      colors: Array.isArray(ability?.colors) ? ability.colors : ["#ffffff", "#cccccc", "#888888"],
      audioClips: Array.isArray(ability?.soundEffects) ? ability.soundEffects : [],
      attackerAudioClips: Array.isArray(ability?.attackerSoundEffects) ? ability.attackerSoundEffects : [],
      hearDistance: Math.max(range * 1.25, 1200),
      ownerId: shooter.userId,
    },
  };
}

function applyRayCapsuleAbility(player, room, ability) {
  const { hits, effect } = computeCapsuleRayHits(player, room, ability);
  hits.forEach(({ target, damage, knockback }) => {
    target.hp = Math.max(0, target.hp - damage);
    target.attributes.isHit = true;
    target.attributes.hitCooldown = Date.now();
    target.attributes.dazed = true;
    setTimeout(() => {
      target.attributes.dazed = false;
    }, 120);

    const dir = effect.direction;
    const pushX = Math.cos(dir) * knockback;
    const pushY = Math.sin(dir) * knockback;
    target.x = Math.max(0, Math.min(room.game.worldWidth, target.x + pushX));
    target.y = Math.max(0, Math.min(room.game.worldHeight, target.y + pushY));
  });

  return effect;
}

function executeAbilityServerEffect(player, room, ability, io) {
  if (!ability || !player || !room) return null;

  let payload = null;

  // Default behavior by type.
  if (ability.type === "ray") {
    payload = applyRayCapsuleAbility(player, room, ability);
  }

  // Custom per-ability behavior can override/extend default.
  const customEffect =
    typeof ability.effect === "function"
      ? ability.effect
      : typeof ability.efffect === "function"
        ? ability.efffect
        : null;

  if (customEffect) {
    const customPayload = customEffect(player, room, {
      io,
      ability,
      helpers: {
        applyRayCapsuleAbility,
        computeCapsuleRayHits,
      },
    });
    if (customPayload && typeof customPayload === "object") {
      payload = customPayload;
    }
  }

  return payload;
}

function getUserRoomFromRooms(userId, rooms) {
  if (!rooms || typeof rooms.forEach !== "function") return null;
  let foundRoom = null;
  rooms.forEach((room) => {
    if (foundRoom || !room || !room.game || !room.game.players) return;
    if (room.game.players.has(userId)) {
      foundRoom = room;
    }
  });
  return foundRoom;
}

function playerWantToUseAbility(userId, index, rooms, io) {
  const room = getUserRoomFromRooms(userId, rooms);
  if (!room || !room.game) return null;
  const player = room.game.players.get(userId);
  if (!player) return null;

  const abilityKey = String(index).toUpperCase();
  if (!player.abilities.has(abilityKey)) {
    console.log(`Player ${userId} does not have ability with index ${abilityKey}`);
    return null;
  }

  const ability = player.abilities.get(abilityKey);
  if (ability.activeCooldown) {
    console.log(`Player ${userId} tried to use ability ${abilityKey} but it's on cooldown`);
    return null;
  }

  ability.activeCooldown = true;
  ability.lastUsedAt = Date.now();
  const cooldownMs = Math.max(0, Number(ability.cooldown || 0) * 1000);
  if (cooldownMs > 0) {
    setTimeout(() => {
      ability.activeCooldown = false;
    }, cooldownMs);
  } else {
    ability.activeCooldown = false;
  }

  console.log(`Player ${userId} is using ability ${abilityKey}`);

  const effectPayload = executeAbilityServerEffect(player, room, ability, io);
  if (effectPayload && io) {
    io.to(room.roomId).emit("018", effectPayload);
  }
}
function toClientGame(game) {
  if (!game) return null;
  return {
    worldWidth: game.worldWidth,
    worldHeight: game.worldHeight,
    playerSpeed: game.playerSpeed,
    seed: game.seed,
    nAbilities: game.nAbilities,
    lives: game.lives,
    obstacles: Array.isArray(game.obstacles) ? game.obstacles : [],
    players: Array.from(game.players.values()).map((player) => ({
      userId: player.userId,
      userName: player.userName,
      x: player.x,
      y: player.y,
      points: player.points ?? 0,
      hp: player.hp,
      attributes: player.attributes,
      abilitiesActive: player.activeAbilities,
      energy: player.energy,
    })),
    moveSmoothness: game.moveSmoothness,
  };
}

function startGame(io, roomId, rooms) {
  rooms.get(roomId).isPlaying = true;
  const room = rooms.get(roomId);
  const seed = `${roomId}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  const obstacles = buildWorldObstacles(seed);
  room.game = {
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    lives: 3,
    nAbilities: 4,
    playerSpeed: PLAYER_SPEED,
    seed,
    obstacles,
    players: new Map(),
    moveSmoothness: MOVE_SMOOTHNESS,
  };
  room.players.forEach((value, key) => {
    if (!value || !value.userId) {
      return;
    }
    const spawn = randomSpawnPosition();
    room.game.players.set(key, {
      userId: value.userId,
      userName: value.userName,
      x: spawn.x,
      y: spawn.y,
      direction: 0,
      points: 0,
      hp: 100,
      energy: 100,
      lives: 3,
      keyDowns: new Map(),
      attributes: {
        isHit: false,
        hitCooldown: 0,
        holding: null,
        invulnerable: false,
        dazed: false,
        speedPercentage: 1,
        domainPoints: 0,
        energyRegenPercentage: 1,
      },
      abilities: new Map(),
      activeAbilities: [],
    });

    room.game.players.get(key).abilities.set("Q", createAbilityInstance(DEFAULT_ABILITYES[0]));
    let abilitiesIndex = ["Q"];
    if (test) {
      ABILITIES.forEach((ability, index) => {
        const abilityKey = String(index + 1);
        room.game.players.get(key).abilities.set(abilityKey, createAbilityInstance(ability));
        abilitiesIndex.push(abilityKey);
      });
    } else 
    {
      //nAbilities random per ogni giocatore tra quelle disponibili, per ora assegno sempre le stesse
      /*const availableAbilities = [...ABILITIES];
      for (let i = 0; i < room.game.nAbilities; i++) {
        if (availableAbilities.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availableAbilities.length);
        const ability = availableAbilities.splice(randomIndex, 1)[0];
        const abilityKey = String(i + 1);
        room.game.players.get(key).abilities.set(abilityKey, ability);
        abilitiesIndex.push(abilityKey);
      }*/
    }
    //manda le abilità di ogni player a ogni user con il suo socket 
    //prendi il socket id dallo user da users 
    const socket = getScoket(value.userId);
    if (socket) {
      socket.emit("019", abilitiesIndex);
    }

  });
  io.to(roomId).emit("014", roomId);
  io.to(roomId).emit("015", toClientGame(room.game));
  room.game.players.forEach((player) => {
    console.log(`Player ${player.userId} - ${player.userName} spawned at (${player.x}, ${player.y}) with HP: ${player.hp} and Energy: ${player.energy}`);
    console.log(`Abilities: ${Array.from(player.abilities.entries()).map(([key, ability]) => `${key}: ${ability.name}`).join(", ")}`);
    console.log(`Attributes: ${JSON.stringify(player.attributes)}`);
  });
  room.gameInterval = setInterval(() => {
    const currentRoom = rooms.get(roomId);
    if (!currentRoom || !currentRoom.isPlaying || !currentRoom.game) {
      clearInterval(room.gameInterval);
      room.gameInterval = null;
      return;
    }

    if (currentRoom.players.size === 0 || currentRoom.game.players.size === 0) {
      clearInterval(room.gameInterval);
      room.gameInterval = null;
      currentRoom.isPlaying = false;
      currentRoom.game = null;
      return;
    }

    const playersPayload = [];

    currentRoom.game.players.forEach((player) => {
      if (!player) {
        return;
      }

      player.x = Math.max(0, Math.min(currentRoom.game.worldWidth, player.x));
      player.y = Math.max(0, Math.min(currentRoom.game.worldHeight, player.y));

      playersPayload.push({
        userId: player.userId,
        userName: player.userName,
        x: player.x,
        y: player.y,
        direction: player.direction ?? 0,
        points: player.points ?? 0,
        hp: player.hp,
        attributes: player.attributes,
        abilitiesActive: player.activeAbilities,
        energy: player.energy,
      });
    });

    io.volatile.to(roomId).emit("016", playersPayload);
  }, 1000 / 60);
}

export {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PLAYER_SPEED,
  MOVE_SMOOTHNESS,
  toClientGame,
  startGame,
  playerWantToUseAbility,
};
