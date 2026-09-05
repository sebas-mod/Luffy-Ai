const pluginConfig = {
  name: "dash",
  alias: ["gd", "geometrydash", "geodash", "geometry", "saltar"],
  category: "game",
  description: "Geometry Dash Mini neón RGB: niveles progresivos, velocidad creciente y sonido.",
  usage: "..dash",
  example: "..dash",
  isOwner: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  isEnabled: true,
}

const GAME_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<style>
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

body {
  background: transparent;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  touch-action: manipulation;
  cursor: pointer;
}

.gd-wrap {
  width: 100%;
  max-width: 640px;
  margin: auto;
  padding: 10px;
}

.gd-card {
  overflow: hidden;
  border-radius: 24px;

  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(0,255,255,.16),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 30%,
      rgba(255,0,200,.14),
      transparent 30%
    ),
    linear-gradient(
      145deg,
      #080b18,
      #0b1020 45%,
      #11091c
    );

  border: 1px solid rgba(0,255,255,.28);

  box-shadow:
    0 15px 55px rgba(0,0,0,.55),
    inset 0 0 40px rgba(0,255,255,.035);
}

.gd-head {
  min-height: 145px;
  padding: 18px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  border-bottom:
    1px solid rgba(255,255,255,.08);
}

.gd-brand {
  color: #00f6ff;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 3px;

  text-shadow:
    0 0 8px #00f6ff,
    0 0 18px rgba(0,246,255,.8);
}

.gd-title {
  margin-top: 5px;

  font-size: 30px;
  line-height: 1;
  font-weight: 900;

  color: white;

  text-shadow:
    0 0 10px rgba(255,255,255,.25),
    0 0 25px rgba(0,255,255,.18);
}

.gd-right {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.gd-sound {
  width: 45px;
  height: 45px;

  border-radius: 13px;

  border: 1px solid rgba(0,255,255,.3);

  background:
    linear-gradient(
      135deg,
      rgba(0,255,255,.12),
      rgba(180,0,255,.12)
    );

  color: #00f6ff;
  font-size: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  box-shadow:
    0 0 12px rgba(0,255,255,.15);
}

.gd-score {
  text-align: right;
  min-width: 72px;
}

#score {
  font-size: 31px;
  line-height: 1;
  font-weight: 900;

  color: #00f6ff;

  text-shadow:
    0 0 7px #00f6ff,
    0 0 18px rgba(0,246,255,.8);
}

.best-label {
  margin-top: 7px;

  color: rgba(255,255,255,.45);

  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
}

#best {
  color: rgba(255,255,255,.8);
  font-size: 16px;
  font-weight: 900;
}

.gd-body {
  padding: 17px;
}

.gd-progress {
  width: 100%;
  height: 8px;

  margin-bottom: 15px;

  overflow: hidden;
  border-radius: 20px;

  background: rgba(255,255,255,.08);

  box-shadow:
    inset 0 0 8px rgba(0,0,0,.5);
}

#progress {
  width: 3%;
  height: 100%;

  border-radius: 20px;

  background:
    linear-gradient(
      90deg,
      #00f6ff,
      #168cff,
      #7c4dff,
      #ff2ed1
    );

  box-shadow:
    0 0 8px #00f6ff,
    0 0 16px rgba(0,246,255,.6);

  transition: width .12s linear;
}

.gd-stage {
  position: relative;

  width: 100%;

  overflow: hidden;

  border-radius: 17px;

  border:
    1px solid rgba(0,255,255,.45);

  background: #050714;

  box-shadow:
    inset 0 0 35px rgba(0,0,0,.9),
    0 0 10px rgba(0,255,255,.2),
    0 0 30px rgba(150,0,255,.08);
}

canvas {
  display: block;

  width: 100%;
  height: auto;

  aspect-ratio: 560 / 400;

  background: #050714;
}

.gd-bottom {
  display: flex;
  justify-content: space-between;

  margin-top: 11px;

  color: rgba(255,255,255,.75);

  font-size: 14px;
  font-weight: 900;
}

#speed {
  color: #00f6ff;

  text-shadow:
    0 0 8px rgba(0,246,255,.7);
}

#level {
  color: #ff4bd8;

  text-shadow:
    0 0 8px rgba(255,75,216,.7);
}

.gd-help {
  margin-top: 8px;

  text-align: center;

  color: rgba(255,255,255,.4);

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 1px;
}
</style>
</head>

<body>

<div class="gd-wrap">

  <div class="gd-card">

    <div class="gd-head">

      <div>
        <div class="gd-brand">
          ◆ LUFFY AI
        </div>

        <div class="gd-title">
          Geometry<br>
          Dash Mini
        </div>
      </div>

      <div class="gd-right">

        <button
          id="sound"
          class="gd-sound"
          type="button"
        >
          🔊
        </button>

        <div class="gd-score">

          <div id="score">
            0000
          </div>

          <div class="best-label">
            🏆 BEST
          </div>

          <div id="best">
            0000
          </div>

        </div>

      </div>

    </div>

    <div class="gd-body">

      <div class="gd-progress">
        <div id="progress"></div>
      </div>

      <div class="gd-stage">

        <canvas
          id="game"
          width="560"
          height="400"
        ></canvas>

      </div>

      <div class="gd-bottom">

        <div id="level">
          Level 1
        </div>

        <div id="speed">
          Speed 5.3x
        </div>

      </div>

      <div class="gd-help">
        TOCA PARA SALTAR
      </div>

    </div>

  </div>

</div>

<script>
(function() {

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const speedEl = document.getElementById("speed");
const levelEl = document.getElementById("level");
const progressEl = document.getElementById("progress");
const soundBtn = document.getElementById("sound");

const W = 560;
const H = 400;

const GROUND = 340;
const PLAYER_X = 105;

let player;

let obstacles = [];
let particles = [];
let stars = [];

let score = 0;
let best = 0;

let speed = 6.8;
let level = 1;

let spawnTimer = 58;

let gameOver = false;

let last = 0;
let worldTime = 0;

let shake = 0;
let flash = 0;

let soundEnabled = true;
let audioCtx = null;


// =============================
// RECORD
// =============================

function readBest() {

  let values = [];

  try {

    const local =
      localStorage.getItem(
        "geometry_dash_best"
      );

    if (local) {
      values.push(
        parseInt(local, 10)
      );
    }

  } catch (e) {}

  try {

    const session =
      sessionStorage.getItem(
        "geometry_dash_best"
      );

    if (session) {
      values.push(
        parseInt(session, 10)
      );
    }

  } catch (e) {}

  values =
    values.filter(
      v => !isNaN(v)
    );

  return values.length
    ? Math.max(...values)
    : 0;
}


function saveBest(value) {

  const val =
    String(
      Math.floor(value)
    );

  try {
    localStorage.setItem(
      "geometry_dash_best",
      val
    );
  } catch (e) {}

  try {
    sessionStorage.setItem(
      "geometry_dash_best",
      val
    );
  } catch (e) {}
}


// =============================
// AUDIO
// =============================

function initAudio() {

  if (!soundEnabled)
    return;

  try {

    if (!audioCtx) {

      audioCtx =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();

    }

    if (
      audioCtx.state ===
      "suspended"
    ) {
      audioCtx.resume();
    }

  } catch (e) {}
}


function beep(
  frequency,
  duration,
  type,
  volume
) {

  if (!soundEnabled)
    return;

  try {

    initAudio();

    if (!audioCtx)
      return;

    const osc =
      audioCtx.createOscillator();

    const gain =
      audioCtx.createGain();

    osc.type =
      type || "square";

    osc.frequency.value =
      frequency;

    gain.gain.setValueAtTime(
      volume || .035,
      audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      .0001,
      audioCtx.currentTime +
      (duration || .08)
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();

    osc.stop(
      audioCtx.currentTime +
      (duration || .08)
    );

  } catch (e) {}
}


// =============================
// STARS
// =============================

function createStars() {

  stars = [];

  for (
    let i = 0;
    i < 120;
    i++
  ) {

    stars.push({

      x: Math.random() * W,

      y:
        10 +
        Math.random() * 300,

      r:
        .4 +
        Math.random() * 1.5,

      speed:
        .1 +
        Math.random() * .5,

      phase:
        Math.random() *
        Math.PI * 2

    });

  }
}


// =============================
// RESET
// =============================

function reset() {

  player = {

    x: PLAYER_X,

    y:
      GROUND - 34,

    w: 34,

    h: 34,

    vy: 0,

    grounded: true,

    squash: 1,

    rot: 0

  };

  obstacles = [];
  particles = [];

  score = 0;

  speed = 6.8;

  level = 1;

  spawnTimer = 58;

  gameOver = false;

  shake = 0;

  flash = 0;

  scoreEl.textContent =
    "0000";

  bestEl.textContent =
    String(
      Math.floor(best)
    ).padStart(4, "0");

  speedEl.textContent =
    "Speed 6.8x";

  levelEl.textContent =
    "Level 1";

  progressEl.style.width =
    "3%";

  createStars();
}


// =============================
// JUMP
// =============================

function jump() {

  initAudio();

  if (gameOver) {

    reset();

    beep(
      440,
      .08,
      "square",
      .04
    );

    return;
  }

  if (!player.grounded)
    return;

  player.grounded = false;

  player.vy = -13.6;

  player.squash = .78;

  burst(
    player.x + 17,
    player.y + 34,
    14,
    "0,238,255",
    4
  );

  beep(
    620,
    .075,
    "square",
    .035
  );
}


// =============================
// PARTICLES
// =============================

function burst(
  px,
  py,
  count,
  color,
  power
) {

  for (
    let i = 0;
    i < count;
    i++
  ) {

    particles.push({

      x: px,

      y: py,

      vx:
        (Math.random() - .5) *
        power,

      vy:
        -Math.random() *
        power,

      life: 1,

      size:
        1.5 +
        Math.random() * 3,

      color

    });

  }
}


// =============================
// OBSTACLES
// =============================

function addSpike(
  x,
  size
) {

  obstacles.push({

    type: "spike",

    x,

    y:
      GROUND - size,

    w: size,

    h: size

  });
}


function addBlock(
  x,
  w,
  h
) {

  obstacles.push({

    type: "block",

    x,

    y:
      GROUND - h,

    w,

    h

  });
}


// =============================
// PATTERNS
// =============================

function spawnPattern() {

  const r =
    Math.random();

  if (level < 2) {

    if (r < .72) {

      addSpike(
        W + 15,
        28
      );

    } else {

      addSpike(
        W + 15,
        28
      );

      addSpike(
        W + 49,
        28
      );

    }

  }

  else if (level < 4) {

    if (r < .42) {

      addSpike(
        W + 15,
        28
      );

      addSpike(
        W + 49,
        28
      );

    }

    else if (r < .72) {

      addBlock(
        W + 15,
        30,
        32
      );

    }

    else {

      addSpike(
        W + 15,
        30
      );

      addSpike(
        W + 52,
        30
      );

      addSpike(
        W + 89,
        30
      );

    }

  }

  else {

    if (r < .28) {

      addSpike(
        W + 15,
        29
      );

      addSpike(
        W + 50,
        29
      );

      addSpike(
        W + 85,
        29
      );

    }

    else if (r < .52) {

      addBlock(
        W + 15,
        30,
        35
      );

      addSpike(
        W + 62,
        27
      );

    }

    else if (r < .76) {

      addSpike(
        W + 15,
        30
      );

      addSpike(
        W + 50,
        30
      );

      addBlock(
        W + 88,
        30,
        30
      );

    }

    else {

      addBlock(
        W + 15,
        27,
        40
      );

      addBlock(
        W + 58,
        27,
        40
      );

    }

  }
}


// =============================
// COLLISION
// =============================

function hitbox() {

  return {

    x:
      player.x + 6,

    y:
      player.y + 5,

    w:
      player.w - 12,

    h:
      player.h - 7

  };
}


function collide(a, b) {

  return (

    a.x <
      b.x + b.w &&

    a.x + a.w >
      b.x &&

    a.y <
      b.y + b.h &&

    a.y + a.h >
      b.y

  );
}


function obstacleHit(o) {

  const p =
    hitbox();

  if (
    o.type ===
    "block"
  ) {

    return collide(
      p,
      o
    );

  }

  const spikeBox = {

    x:
      o.x + 5,

    y:
      o.y + 8,

    w:
      o.w - 10,

    h:
      o.h - 8

  };

  return collide(
    p,
    spikeBox
  );
}


// =============================
// NEON BACKGROUND
// =============================

function drawBackground() {

  // Fondo vertical

  const bg =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );

  bg.addColorStop(
    0,
    "#050713"
  );

  bg.addColorStop(
    .45,
    "#09091d"
  );

  bg.addColorStop(
    1,
    "#10051a"
  );

  ctx.fillStyle = bg;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  // Aura RGB superior

  const hue =
    (worldTime * 2) % 360;

  const rgbAura =
    ctx.createLinearGradient(
      0,
      0,
      W,
      0
    );

  rgbAura.addColorStop(
    0,
    "hsla(" +
      hue +
      ",100%,60%,.15)"
  );

  rgbAura.addColorStop(
    .5,
    "hsla(" +
      ((hue + 120) % 360) +
      ",100%,60%,.12)"
  );

  rgbAura.addColorStop(
    1,
    "hsla(" +
      ((hue + 240) % 360) +
      ",100%,60%,.15)"
  );

  ctx.fillStyle =
    rgbAura;

  ctx.fillRect(
    0,
    0,
    W,
    320
  );


  // Estrellas

  stars.forEach(
    function(s) {

      const alpha =
        .25 +
        .4 *
          Math.sin(
            worldTime * .04 +
            s.phase
          );

      ctx.fillStyle =
        "rgba(150,240,255," +
        alpha +
        ")";

      ctx.shadowColor =
        "#00eaff";

      ctx.shadowBlur =
        5;

      ctx.beginPath();

      ctx.arc(
        s.x,
        s.y,
        s.r,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.shadowBlur = 0;

      s.x -=
        s.speed *
        speed *
        .12;

      if (s.x < -5) {

        s.x =
          W + 5;

        s.y =
          10 +
          Math.random() *
            300;

      }

    }
  );


  // Cuadrícula horizontal RGB

  const gridHue =
    (worldTime * 3) %
    360;

  ctx.lineWidth = 1;

  for (
    let y = GROUND;
    y < H;
    y += 10
  ) {

    ctx.strokeStyle =
      "hsla(" +
      gridHue +
      ",100%,60%,.11)";

    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    ctx.lineTo(
      W,
      y
    );

    ctx.stroke();

  }


  // Cuadrícula vertical

  const offset =
    (worldTime *
      speed *
      1.2) %
    40;

  for (
    let x = -40 + offset;
    x < W + 40;
    x += 40
  ) {

    const lineHue =
      (
        gridHue +
        (x * .5)
      ) % 360;

    ctx.strokeStyle =
      "hsla(" +
      lineHue +
      ",100%,65%,.18)";

    ctx.beginPath();

    ctx.moveTo(
      x,
      GROUND
    );

    ctx.lineTo(
      x - 24,
      H
    );

    ctx.stroke();

  }


  // Línea principal del suelo

  const floorHue =
    (worldTime * 5) %
    360;

  ctx.strokeStyle =
    "hsl(" +
    floorHue +
    ",100%,65%)";

  ctx.lineWidth = 3;

  ctx.shadowColor =
    "hsl(" +
    floorHue +
    ",100%,60%)";

  ctx.shadowBlur =
    16;

  ctx.beginPath();

  ctx.moveTo(
    0,
    GROUND
  );

  ctx.lineTo(
    W,
    GROUND
  );

  ctx.stroke();

  ctx.shadowBlur = 0;


  // Segunda línea RGB debajo

  ctx.lineWidth = 1;

  ctx.strokeStyle =
    "rgba(255,0,220,.7)";

  ctx.shadowColor =
    "#ff00d9";

  ctx.shadowBlur =
    9;

  ctx.beginPath();

  ctx.moveTo(
    0,
    GROUND + 5
  );

  ctx.lineTo(
    W,
    GROUND + 5
  );

  ctx.stroke();

  ctx.shadowBlur = 0;
}


// =============================
// PLAYER
// =============================

function drawPlayer() {

  ctx.save();

  const cx =
    player.x + 17;

  const cy =
    player.y + 17;

  ctx.translate(
    cx,
    cy
  );

  ctx.rotate(
    player.rot
  );

  ctx.scale(
    1 / player.squash,
    player.squash
  );


  // Aura RGB

  const playerHue =
    (worldTime * 8) %
    360;

  ctx.shadowColor =
    "hsl(" +
    playerHue +
    ",100%,65%)";

  ctx.shadowBlur =
    22;


  // Cubo

  const grad =
    ctx.createLinearGradient(
      -17,
      -17,
      17,
      17
    );

  grad.addColorStop(
    0,
    "#00f6ff"
  );

  grad.addColorStop(
    .33,
    "#168cff"
  );

  grad.addColorStop(
    .66,
    "#7c4dff"
  );

  grad.addColorStop(
    1,
    "#ff2ed1"
  );

  ctx.fillStyle =
    grad;

  ctx.fillRect(
    -17,
    -17,
    34,
    34
  );


  ctx.shadowBlur = 0;


  // Borde

  ctx.strokeStyle =
    "#ffffff";

  ctx.lineWidth = 2;

  ctx.strokeRect(
    -14,
    -14,
    28,
    28
  );


  // Ojos

  ctx.fillStyle =
    "white";

  ctx.fillRect(
    -8,
    -8,
    5,
    5
  );

  ctx.fillRect(
    4,
    -8,
    5,
    5
  );


  // Boca

  ctx.fillStyle =
    "rgba(0,0,20,.8)";

  ctx.fillRect(
    -8,
    5,
    16,
    3
  );


  ctx.restore();
}


// =============================
// SPIKES
// =============================

function drawSpike(o) {

  ctx.save();

  const hue =
    (worldTime * 7 + o.x) %
    360;

  ctx.shadowColor =
    "hsl(" +
    hue +
    ",100%,60%)";

  ctx.shadowBlur =
    18;

  const grad =
    ctx.createLinearGradient(
      o.x,
      o.y,
      o.x,
      o.y + o.h
    );

  grad.addColorStop(
    0,
    "#ffffff"
  );

  grad.addColorStop(
    .15,
    "#ff4bd8"
  );

  grad.addColorStop(
    .55,
    "#ff168e"
  );

  grad.addColorStop(
    1,
    "#693cff"
  );

  ctx.fillStyle =
    grad;

  ctx.beginPath();

  ctx.moveTo(
    o.x,
    o.y + o.h
  );

  ctx.lineTo(
    o.x + o.w / 2,
    o.y
  );

  ctx.lineTo(
    o.x + o.w,
    o.y + o.h
  );

  ctx.closePath();

  ctx.fill();


  ctx.strokeStyle =
    "rgba(255,255,255,.9)";

  ctx.lineWidth = 1.5;

  ctx.stroke();


  ctx.restore();
}


// =============================
// BLOCKS
// =============================

function drawBlock(o) {

  ctx.save();

  const hue =
    (worldTime * 5 + o.x) %
    360;

  ctx.shadowColor =
    "hsl(" +
    hue +
    ",100%,60%)";

  ctx.shadowBlur =
    17;


  const grad =
    ctx.createLinearGradient(
      o.x,
      o.y,
      o.x + o.w,
      o.y + o.h
    );

  grad.addColorStop(
    0,
    "#00f6ff"
  );

  grad.addColorStop(
    .4,
    "#258cff"
  );

  grad.addColorStop(
    .75,
    "#7c4dff"
  );

  grad.addColorStop(
    1,
    "#ff2ed1"
  );

  ctx.fillStyle =
    grad;

  ctx.fillRect(
    o.x,
    o.y,
    o.w,
    o.h
  );


  // Interior oscuro

  ctx.fillStyle =
    "rgba(5,8,25,.72)";

  ctx.fillRect(
    o.x + 5,
    o.y + 5,
    o.w - 10,
    o.h - 10
  );


  // Borde

  ctx.strokeStyle =
    "rgba(255,255,255,.85)";

  ctx.lineWidth = 1;

  ctx.strokeRect(
    o.x + 3,
    o.y + 3,
    o.w - 6,
    o.h - 6
  );


  // Detalle interno

  ctx.strokeStyle =
    "rgba(0,255,255,.7)";

  ctx.lineWidth = 1;

  ctx.beginPath();

  ctx.moveTo(
    o.x + 8,
    o.y + o.h - 8
  );

  ctx.lineTo(
    o.x + o.w - 8,
    o.y + 8
  );

  ctx.stroke();


  ctx.restore();
}


// =============================
// PARTICLES
// =============================

function drawParticles() {

  particles.forEach(
    function(p) {

      ctx.fillStyle =
        "rgba(" +
        p.color +
        "," +
        Math.max(
          0,
          p.life
        ) +
        ")";

      ctx.shadowColor =
        "rgba(" +
        p.color +
        ",1)";

      ctx.shadowBlur =
        8;

      ctx.fillRect(
        p.x,
        p.y,
        p.size,
        p.size
      );

      ctx.shadowBlur = 0;

    }
  );
}


// =============================
// GAME OVER
// =============================

function drawGameOver() {

  if (!gameOver)
    return;


  ctx.fillStyle =
    "rgba(3,4,14,.68)";

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  ctx.textAlign =
    "center";


  ctx.shadowColor =
    "#00f6ff";

  ctx.shadowBlur =
    20;

  ctx.fillStyle =
    "white";

  ctx.font =
    "900 28px Arial";

  ctx.fillText(
    "GAME OVER",
    W / 2,
    175
  );


  ctx.shadowBlur = 0;

  ctx.font =
    "bold 13px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,.8)";

  ctx.fillText(
    "TOCA PARA VOLVER A JUGAR",
    W / 2,
    205
  );


  ctx.textAlign =
    "left";
}


// =============================
// DRAW
// =============================

function draw() {

  ctx.save();


  if (shake > 0) {

    ctx.translate(
      (Math.random() - .5) *
        shake,

      (Math.random() - .5) *
        shake
    );

  }


  drawBackground();


  obstacles.forEach(
    function(o) {

      if (
        o.type ===
        "spike"
      ) {

        drawSpike(o);

      } else {

        drawBlock(o);

      }

    }
  );


  drawParticles();

  drawPlayer();


  if (flash > 0) {

    ctx.fillStyle =
      "rgba(255,20,120," +
      (flash * .22) +
      ")";

    ctx.fillRect(
      0,
      0,
      W,
      H
    );

  }


  ctx.restore();


  drawGameOver();
}


// =============================
// UPDATE
// =============================

function update(t) {

  if (!last)
    last = t;

  const dt =
    Math.min(
      (t - last) / 16.67,
      2
    );

  last = t;

  worldTime += dt;


  if (!gameOver) {


    // Física

    player.y +=
      player.vy * dt;

    player.vy +=
      1.0 * dt;


    // Suelo

    if (
      player.y >=
      GROUND -
      player.h
    ) {

      if (
        !player.grounded
      ) {

        burst(
          player.x + 17,
          GROUND,
          10,
          "0,238,255",
          3
        );

        player.squash =
          1.22;

      }

      player.y =
        GROUND -
        player.h;

      player.vy = 0;

      player.grounded =
        true;
    }


    player.squash +=
      (
        1 -
        player.squash
      ) *
      .16 *
      dt;


    // Rotación

    if (
      !player.grounded
    ) {

      player.rot +=
        .075 *
        dt;

    } else {

      player.rot =
        Math.round(
          player.rot /
          (Math.PI / 2)
        ) *
        (Math.PI / 2);

    }


    // Spawn

    spawnTimer -= dt;


    if (
      spawnTimer <= 0
    ) {

      spawnPattern();


      const difficulty =
        Math.min(
          34,
          level * 3
        );


      spawnTimer =
        Math.max(
          40,
          72 - difficulty
        ) +
        Math.random() *
          24;

    }


    // Movimiento

    obstacles.forEach(
      function(o) {

        o.x -=
          speed *
          dt;

      }
    );


    obstacles =
      obstacles.filter(
        function(o) {

          return (
            o.x > -80
          );

        }
      );


    // Partículas

    particles.forEach(
      function(p) {

        p.x +=
          p.vx *
          dt;

        p.y +=
          p.vy *
          dt;

        p.vy +=
          .24 *
          dt;

        p.life -=
          .045 *
          dt;

      }
    );


    particles =
      particles.filter(
        function(p) {

          return p.life > 0;

        }
      );


    // Score

    score +=
      speed *
      .075 *
      dt;


    // Velocidad progresiva

    speed =
      Math.min(
        13.5,
        6.8 +
          score *
            .0014
      );


    // Level

    level =
      Math.max(
        1,
        Math.floor(
          score / 500
        ) + 1
      );


    // Record

    if (
      score >
      best
    ) {

      best =
        score;

    }


    // Colisiones

    for (
      let i = 0;
      i < obstacles.length;
      i++
    ) {

      if (
        obstacleHit(
          obstacles[i]
        )
      ) {

        gameOver =
          true;

        shake = 13;

        flash = 1;


        burst(
          player.x + 17,
          player.y + 17,
          30,
          "255,45,120",
          6
        );


        saveBest(
          best
        );


        beep(
          130,
          .22,
          "sawtooth",
          .045
        );


        break;
      }

    }


    // UI

    scoreEl.textContent =
      String(
        Math.floor(score)
      ).padStart(
        4,
        "0"
      );


    bestEl.textContent =
      String(
        Math.floor(best)
      ).padStart(
        4,
        "0"
      );


    speedEl.textContent =
      "Speed " +
      speed.toFixed(1) +
      "x";


    levelEl.textContent =
      "Level " +
      level;


    const progress =
      (
        (score % 500) /
        500
      ) *
      100;


    progressEl.style.width =
      Math.max(
        3,
        progress
      ) + "%";

  }


  if (
    shake > 0
  ) {

    shake =
      Math.max(
        0,
        shake -
          .65 *
          dt
      );

  }


  if (
    flash > 0
  ) {

    flash =
      Math.max(
        0,
        flash -
          .055 *
          dt
      );

  }


  draw();


  requestAnimationFrame(
    update
  );

}


// =============================
// SONIDO
// =============================

function toggleSound() {

  soundEnabled =
    !soundEnabled;

  soundBtn.textContent =
    soundEnabled
      ? "🔊"
      : "🔇";

  if (
    soundEnabled
  ) {

    initAudio();

    beep(
      700,
      .07,
      "square",
      .035
    );

  }

}


soundBtn.addEventListener(
  "pointerdown",
  function(e) {

    e.preventDefault();
    e.stopPropagation();

    toggleSound();

  },
  { passive: false }
);


soundBtn.addEventListener(
  "touchstart",
  function(e) {

    e.preventDefault();
    e.stopPropagation();

    toggleSound();

  },
  { passive: false }
);


// =============================
// TOUCH
// =============================
//
// IMPORTANTE:
// Solo funciona por toque en pantalla.
// Sin teclado, sin Space.
//

let lastTap = 0;

function onTap(e) {

  if (
    e.target ===
    soundBtn
  ) {
    return;
  }

  const now = Date.now();
  if (now - lastTap < 100)
    return;
  lastTap = now;

  e.preventDefault();

  jump();

}


document.addEventListener(
  "pointerdown",
  function(e) {

    if (
      e.pointerType &&
      e.pointerType === "mouse"
    ) {
      return;
    }

    onTap(e);

  },
  { passive: false }
);


document.addEventListener(
  "touchstart",
  function(e) {

    onTap(e);

  },
  { passive: false }
);


// =============================
// START
// =============================

best =
  readBest();

reset();

requestAnimationFrame(
  update
);

})();
</script>

</body>
</html>`

async function handler(m, { sock }) {
  const from = m.chat
  try {
    const msgContent = {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: "",
          botResponseId: "b2e40280-433c-45d8-9c1a-270bec558860",
          verificationMetadata: {
            proofs: [
              {
                version: 1,
                useCase: 1,
                signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
                certificateChain: [
                  "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg",
                  "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZLXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYbNBkuLoZnQAq4j8yRekrQ=="
                ]
              }
            ]
          }
        }
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              {
                messageType: 2,
                messageText: "Fiora Sylvie"
              }
            ],
            unifiedResponse: {
              data: Buffer.from(JSON.stringify({"response_id":"c27e4d9f-5a1b-4c6d-a3e8-07f5b2c8d6a9","sections":[{"view_model":{"primitive":{"__typename":"GenAIaeacdsnwHtmlPrimitive","payload":GAME_HTML,"trusted_sources":["nixel.dev"]},"__typename":"GenAISingleLayoutViewModel"}}]})).toString('base64')
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: "867051314767696@bot"
              },
              forwardOrigin: 4
            }
          }
        }
      }
    }
    await sock.relayMessage(from, msgContent, {})
  } catch (e) {
    console.error('Error en geometrydash:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }