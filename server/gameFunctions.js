import { re } from "mathjs";
import { getSocket } from "./server.js";

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 3000;
const PLAYER_SPEED = 320;
const MOVE_SMOOTHNESS = 18;
const RESPAWN_DELAY_MS = 3000;
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

const DEFAULT_ABILITYES = [
  {
    name: "dash",
    key: "Q",
    cooldown: 3,
    duration: 0.3,
    activeCooldown: false,
    effect: (player) => {
      if (!player?.attributes) return null;
      player.attributes.invulnerable = true;
      player.attributes.speedPercentage = 2.5;
      setTimeout(() => {
        if (!player?.attributes) return;
        player.attributes.invulnerable = false;
        player.attributes.speedPercentage = 1;
      }, 300);
      return {
        abilityKey: "Q",
        abilityName: "dash",
        type: "dash",
        x: player.x,
        y: player.y,
        direction: Number.isFinite(player.direction) ? player.direction : 0,
        duration: 0.3,
        ownerId: player.userId,
        hearDistance: 800,
      };
    },
  },
];

const ABILITIES = [
  {
    name: "Granitè blast",
    key: "1",
    type: "ray",
    radius: 50,
    damage: 100,
    range: 4000,
    cooldown: 10,
    duration: 0.4,
    colors: ["#D5F2F8", "#61EBF5", "#4AFAFA"],
    effect: (player, room, ctx) => {
      return ctx.helpers.applyRayCapsuleAbility(player, room, ctx.ability);
    },
  },
  {
    name: "Cero",
    key: "2",
    type: "ray",
    radius: 80,
    damage: 100,
    range: 2000,
    cooldown: 8,
    duration: 1,
    colors: ["#f12e2e", "#df6b6b", "#330202"],
    effect: (player, room, ctx) => {
      return ctx.helpers.applyRayCapsuleAbility(player, room, ctx.ability);
    },
  },
   {
    name: "Hollow Purple",
    key: "3",
    type: "projectile",
    shape: "circle",
    radius: 600,
    damage: 100,
    range: 8000,
    cooldown: 15,
    speed: 1200,
    colors: ["#FFEAFF", "#FF66FF", "#FF46FF"],
    effect: (player, room, ctx) => {
      return ctx.helpers.applyProjectileAbility(player, room, {
        ...ctx.ability,
        shape: "circle",
      });
    },
  },
  {
    name: "Dismantle",
    key: "4",
    type: "projectile",
    shape: "crescentMoon",
    radius: 300,
    damage: 100,
    range: 1000,
    cooldown: 12,
    speed: 4000,
    colors: ["#000000", "#ff0000"],
    effect: (player, room, ctx) => {
      return ctx.helpers.applyProjectileAbility(player, room, {
        ...ctx.ability,
        shape: "crescentMoon",
      });
    },
  },
];

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

function schedulePlayerRespawn(player, room, delayMs = RESPAWN_DELAY_MS) {
  if (!player || !room?.game) return;
  if (player._respawnTimer || player?.attributes?.isRespawning) return;

  if (!player.attributes || typeof player.attributes !== "object") {
    player.attributes = {};
  }

  player.hp = 0;
  player.attributes.isDead = true;
  player.attributes.isRespawning = true;
  player.attributes.invulnerable = true;
  player.attributes.dazed = false;
  player.attributes.holding = null;
  player.attributes.speedPercentage = 0;

  // In modalita non-test consumiamo una vita per il respawn.
  if (!test) {
    const currentLives = Number.isFinite(player.lives) ? player.lives : 1;
    player.lives = Math.max(0, currentLives - 1);
    if (player.lives <= 0) {
      player.attributes.isRespawning = false;
      return;
    }
  }
  const socket = getSocket(player.userId);
  if (socket) {
    socket.emit("020");
  }
  player._respawnTimer = setTimeout(() => {
    player._respawnTimer = null;

    // Se il player non e piu nella room, interrompi il respawn.
    if (!room?.game?.players?.has(player.userId)) return;

    const spawn = randomSpawnPosition();
    const worldWidth = Number(room?.game?.worldWidth || WORLD_WIDTH);
    const worldHeight = Number(room?.game?.worldHeight || WORLD_HEIGHT);

    player.x = Math.max(0, Math.min(worldWidth, spawn.x));
    player.y = Math.max(0, Math.min(worldHeight, spawn.y));
    player.direction = Number.isFinite(player.direction) ? player.direction : 0;
    player.hp = 100;
    player.energy = 100;

    if (!player.attributes || typeof player.attributes !== "object") {
      player.attributes = {};
    }

    player.attributes.isHit = false;
    player.attributes.hitCooldown = Date.now();
    player.attributes.holding = null;
    player.attributes.invulnerable = true;
    player.attributes.dazed = false;
    player.attributes.isDead = false;
    player.attributes.isRespawning = false;
    player.attributes.speedPercentage = 1;

    //manda al player tramite il suo socket il messaggio 021 che indica che è morto, e il suo punto di respawn
    if (socket) {
      socket.emit("021", player.x, player.y);
    }
    // Breve protezione spawn.
    setTimeout(() => {
      if (!player?.attributes) return;
      if (player.attributes.isRespawning) return;
      player.attributes.invulnerable = false;
    }, 700);
  }, Math.max(0, delayMs));
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
    if (target.hp <= 0 || target.attributes?.isRespawning) return;

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
      hearDistance: Math.max(range * 1.25, 1200),
      ownerId: shooter.userId,
    },
  };
}

function applyRayCapsuleAbility(player, room, ability) {
  const { hits, effect } = computeCapsuleRayHits(player, room, ability);
  hits.forEach(({ target, damage, knockback }) => {
    target.hp = Math.max(0, target.hp - damage);
    if (target.hp <= 0) {
      schedulePlayerRespawn(target, room, RESPAWN_DELAY_MS);
      return;
    }

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

function computeProjectileHits(shooter, room, ability) {
  if (!shooter || !room || !room.game || !room.game.players) {
    return { hits: [], effect: null };
  }

  const dir = Number.isFinite(shooter.direction) ? shooter.direction : 0;
  const startX = shooter.x;
  const startY = shooter.y;
  const range = Math.max(60, Number(ability?.range) || 1600);
  const speed = Math.max(120, Number(ability?.speed) || 1000);
  const radius = Math.max(10, Number(ability?.radius) || 90);
  const shape =
    typeof ability?.shape === "string" && ability.shape
      ? ability.shape
      : "circle";
  const endX = startX + Math.cos(dir) * range;
  const endY = startY + Math.sin(dir) * range;

  const travelSeconds = range / speed;
  const duration = Math.max(0.2, Math.min(4, travelSeconds));
  const targetRadius = 18;

  const projectileRadiusScale = shape === "crescentMoon" ? 0.22 : 0.45;
  const projectileRadius = Math.max(14, radius * projectileRadiusScale);
  const baseDamage = Math.max(1, Number(ability?.damage) || 100);
  const hits = [];

  room.game.players.forEach((target) => {
    if (!target || target.userId === shooter.userId) return;
    if (target.attributes?.invulnerable) return;
    if (target.hp <= 0 || target.attributes?.isRespawning) return;

    const distToPath = distancePointToSegment(
      target.x,
      target.y,
      startX,
      startY,
      endX,
      endY,
    );
    const edgeDistance = Math.max(0, distToPath - targetRadius);
    if (edgeDistance > projectileRadius) return;

    const closeness = 1 - edgeDistance / projectileRadius;
    const damageFloor = shape === "crescentMoon" ? 0.55 : 0.45;
    const damage = Math.round(
      baseDamage * (damageFloor + (1 - damageFloor) * closeness),
    );
    const knockbackBase = shape === "crescentMoon" ? 220 : 360;
    const knockback = knockbackBase + closeness * 260;
    hits.push({ target, damage, knockback });
  });

  return {
    hits,
    effect: {
      abilityKey: ability?.key || null,
      abilityName: ability?.name || "",
      type: "projectile",
      shape,
      x: startX,
      y: startY,
      direction: dir,
      range,
      radius,
      speed,
      duration,
      colors: Array.isArray(ability?.colors) ? ability.colors : undefined,
      ownerId: shooter.userId,
      hearDistance: Math.max(range * 1.15, 900),
    },
  };
}

function applyProjectileAbility(player, room, ability) {
  const { hits, effect } = computeProjectileHits(player, room, ability);
  if (!effect) return null;

  hits.forEach(({ target, damage, knockback }) => {
    target.hp = Math.max(0, target.hp - damage);
    if (target.hp <= 0) {
      schedulePlayerRespawn(target, room, RESPAWN_DELAY_MS);
      return;
    }

    target.attributes.isHit = true;
    target.attributes.hitCooldown = Date.now();
    target.attributes.dazed = true;
    setTimeout(() => {
      if (!target?.attributes) return;
      target.attributes.dazed = false;
    }, 120);

    const pushX = Math.cos(effect.direction) * knockback;
    const pushY = Math.sin(effect.direction) * knockback;
    target.x = Math.max(0, Math.min(room.game.worldWidth, target.x + pushX));
    target.y = Math.max(0, Math.min(room.game.worldHeight, target.y + pushY));
  });

  return effect;
}

function executeAbilityServerEffect(player, room, ability, io, abilityKey) {
  if (!ability || !player || !room) return null;

  const customEffect =
    typeof ability.effect === "function"
      ? ability.effect
      : typeof ability.efffect === "function"
        ? ability.efffect
        : null;

  if (!customEffect) {
    // Backward compatibility for abilities without custom effect.
    if (ability.type === "ray") {
      return applyRayCapsuleAbility(player, room, ability);
    }
    return null;
  }

  const payload = customEffect(player, room, {
    io,
    ability,
    helpers: {
      applyRayCapsuleAbility,
      computeCapsuleRayHits,
      applyProjectileAbility,
      computeProjectileHits,
    },
  });
  if (!payload || typeof payload !== "object") return null;

  const normalizedAbilityKey = String(abilityKey || "").toUpperCase();
  if (!payload.abilityKey && normalizedAbilityKey) {
    payload.abilityKey = normalizedAbilityKey;
  }
  if (!payload.abilityName && ability?.name) {
    payload.abilityName = ability.name;
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
  if (player.hp <= 0 || player.attributes?.isRespawning || player.attributes?.isDead) {
    return null;
  }

  const abilityKey = String(index).toUpperCase();
  if (!player.abilities.has(abilityKey)) {
    console.log(
      `Player ${userId} does not have ability with index ${abilityKey}`,
    );
    return null;
  }

  const ability = player.abilities.get(abilityKey);
  if (ability.activeCooldown) {
    console.log(
      `Player ${userId} tried to use ability ${abilityKey} but it's on cooldown`,
    );
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

  const effectPayload = executeAbilityServerEffect(
    player,
    room,
    ability,
    io,
    abilityKey,
  );
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
        isDead: false,
        isRespawning: false,
        speedPercentage: 1,
        domainPoints: 0,
        energyRegenPercentage: 1,
      },
      abilities: new Map(),
      activeAbilities: [],
    });

    room.game.players
      .get(key)
      .abilities.set("Q", createAbilityInstance(DEFAULT_ABILITYES[0]));
    let abilitiesIndex = ["Q"];
    if (test) {
      ABILITIES.forEach((ability, index) => {
        const abilityKey = String(index + 1);
        room.game.players
          .get(key)
          .abilities.set(abilityKey, createAbilityInstance(ability));
        abilitiesIndex.push(abilityKey);
      });
    } else {
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
    const socket = getSocket(value.userId);
    if (socket) {
      socket.emit("019", abilitiesIndex);
    }
  });
  io.to(roomId).emit("014", roomId);
  io.to(roomId).emit("015", toClientGame(room.game));
  room.game.players.forEach((player) => {
    console.log(
      `Player ${player.userId} - ${player.userName} spawned at (${player.x}, ${player.y}) with HP: ${player.hp} and Energy: ${player.energy}`,
    );
    console.log(
      `Abilities: ${Array.from(player.abilities.entries())
        .map(([key, ability]) => `${key}: ${ability.name}`)
        .join(", ")}`,
    );
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

    // Non volatile: evitare perdita di tick critici come morte/respawn.
    io.to(roomId).emit("016", playersPayload);
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
