import Phaser from "phaser";
import "./style.css";

const GAME = { width: 1280, height: 720 } as const;
const GLASS = { x: 0, y: 48, width: 1280, height: 620 } as const;
const BRUSH_RADIUS = 44;
const DROP_VARIANTS = 6;
const MAX_DROPS = 5;
const PROGRESS_KEY = "fog-rhythm:level-progress-v1";
const RHYTHM_TICKS = 12;
const PORTRAIT_GAME = window.matchMedia("(orientation: portrait) and (max-width: 640px)");
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

const THEMES = {
  mist: {
    button: "2단계 · 김 서림",
    backdrop: "mist-handdrawn",
    view: "mist-view",
    source: "mist-source",
    ridge: "mist-ridge",
    overlayAlpha: 0.16,
    ridgeScaleY: 0.32,
    ridgeAlpha: 0.24,
    warm: 1,
  },
  frost: {
    button: "1단계 · 겨울 성에",
    backdrop: "frost-handdrawn",
    view: "winter-view",
    source: "frost-source",
    ridge: "frost-ridge",
    overlayAlpha: 0.78,
    ridgeScaleY: 0.78,
    ridgeAlpha: 0.54,
    warm: 0,
  },
  shower: {
    button: "3단계 · 샤워 거울",
    backdrop: "shower-handdrawn",
    view: "shower-view",
    source: "shower-source",
    ridge: "shower-ridge",
    overlayAlpha: 0.26,
    ridgeScaleY: 0.34,
    ridgeAlpha: 0.26,
    warm: 2,
  },
} as const;

type ThemeKey = keyof typeof THEMES;
const STAGE_ORDER: ThemeKey[] = ["frost", "mist", "shower"];

type RhythmPhrase = { beats: number; hits: readonly number[] };
type RhythmPhase = "idle" | "ready" | "listen" | "respond" | "result" | "complete";
type RhythmStage = {
  bpm: number;
  perfect: number;
  good: number;
  pass: readonly number[];
  levels: readonly (readonly RhythmPhrase[])[];
};

const RHYTHMS: Record<ThemeKey, RhythmStage> = {
  frost: {
    bpm: 92,
    perfect: 0.08,
    good: 0.16,
    pass: [0.56, 0.6, 0.62, 0.65, 0.68],
    levels: [
      [
        { beats: 4, hits: [0, 12, 24, 36] },
        { beats: 4, hits: [0, 12, 24] },
        { beats: 4, hits: [0, 12, 24, 36, 42] },
      ],
      [
        { beats: 4, hits: [0, 12, 18, 30, 36] },
        { beats: 4, hits: [0, 6, 12, 24, 36] },
        { beats: 4, hits: [0, 12, 24, 30, 36, 42] },
      ],
      [
        { beats: 4, hits: [0, 6, 12, 24, 30, 36] },
        { beats: 4, hits: [0, 6, 18, 24, 36, 42] },
        { beats: 4, hits: [0, 12, 18, 24, 30, 42] },
      ],
      [
        { beats: 4, hits: [0, 6, 12, 18, 24, 36] },
        { beats: 4, hits: [0, 6, 12, 24, 30, 42] },
        { beats: 4, hits: [0, 12, 18, 24, 36, 42] },
      ],
      [
        { beats: 4, hits: [0, 6, 12, 18, 24, 30, 36] },
        { beats: 4, hits: [0, 6, 12, 18, 24, 30, 42] },
        { beats: 4, hits: [0, 6, 12, 18, 24, 30, 36, 42] },
      ],
    ],
  },
  mist: {
    bpm: 104,
    perfect: 0.07,
    good: 0.14,
    pass: [0.58, 0.62, 0.65, 0.68, 0.7],
    levels: [
      [
        { beats: 4, hits: [0, 18, 30, 42] },
        { beats: 4, hits: [0, 6, 18, 30, 42] },
        { beats: 4, hits: [6, 18, 30, 42] },
      ],
      [
        { beats: 4, hits: [0, 6, 18, 24, 42] },
        { beats: 4, hits: [6, 18, 24, 30, 42] },
        { beats: 4, hits: [0, 18, 24, 36, 42] },
      ],
      [
        { beats: 4, hits: [6, 12, 18, 30, 42] },
        { beats: 4, hits: [0, 6, 18, 30, 36, 42] },
        { beats: 4, hits: [6, 12, 24, 30, 42] },
      ],
      [
        { beats: 4, hits: [6, 12, 18, 30, 36, 42] },
        { beats: 4, hits: [0, 6, 18, 24, 30, 42] },
        { beats: 4, hits: [6, 12, 18, 24, 36, 42] },
      ],
      [
        { beats: 4, hits: [0, 6, 12, 18, 30, 36, 42] },
        { beats: 4, hits: [6, 12, 18, 24, 30, 36, 42] },
        { beats: 4, hits: [0, 6, 18, 24, 30, 36, 42] },
      ],
    ],
  },
  shower: {
    bpm: 96,
    perfect: 0.065,
    good: 0.1,
    pass: [0.6, 0.63, 0.66, 0.69, 0.72],
    levels: [
      [
        { beats: 4, hits: [0, 8, 16, 24, 32, 40] },
        { beats: 4, hits: [0, 8, 12, 20, 24, 32, 36, 44] },
        { beats: 4, hits: [0, 4, 8, 24, 32, 40] },
      ],
      [
        { beats: 4, hits: [0, 4, 8, 24, 32, 36, 44] },
        { beats: 4, hits: [0, 8, 16, 20, 24, 40, 44] },
        { beats: 4, hits: [0, 8, 12, 24, 28, 32, 40] },
      ],
      [
        { beats: 4, hits: [0, 8, 16, 20, 24, 32, 40, 44] },
        { beats: 4, hits: [0, 4, 8, 16, 24, 32, 36, 44] },
        { beats: 4, hits: [0, 8, 12, 16, 24, 32, 40, 44] },
      ],
      [
        { beats: 4, hits: [0, 4, 8, 12, 20, 24, 28, 32, 36, 44] },
        { beats: 4, hits: [0, 8, 12, 16, 20, 24, 32, 36, 40, 44] },
        { beats: 4, hits: [0, 4, 8, 12, 16, 24, 28, 36, 40, 44] },
      ],
      [
        { beats: 4, hits: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 44] },
        { beats: 4, hits: [0, 4, 8, 12, 16, 20, 24, 32, 36, 40, 44] },
        { beats: 4, hits: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44] },
      ],
    ],
  },
};

const scoreRhythmHit = (delta: number, rhythm: RhythmStage) =>
  delta <= rhythm.perfect ? 100 : delta <= rhythm.good ? 70 : 0;

const WET_GLASS_SHADER = `
#pragma phaserTemplate(shaderName)
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uScene;
uniform sampler2D uWet;
uniform sampler2D uFog;
uniform vec2 uTexel;
uniform float uStrength;
uniform float uWarm;
uniform float uTime;
uniform float uBeat;
varying vec2 outTexCoord;

vec3 sceneAt (vec2 point) {
  return texture2D(uScene, clamp(point, uTexel, vec2(1.0) - uTexel)).rgb;
}

vec3 blur5 (vec2 point, vec2 offset) {
  vec3 color = sceneAt(point) * 0.36;
  color += sceneAt(point + vec2(offset.x, 0.0)) * 0.16;
  color += sceneAt(point - vec2(offset.x, 0.0)) * 0.16;
  color += sceneAt(point + vec2(0.0, offset.y)) * 0.16;
  color += sceneAt(point - vec2(0.0, offset.y)) * 0.16;
  return color;
}

void main () {
  vec2 uv = outTexCoord;
  float h = texture2D(uWet, uv).a;
  float hl = texture2D(uWet, uv - vec2(uTexel.x, 0.0)).a;
  float hr = texture2D(uWet, uv + vec2(uTexel.x, 0.0)).a;
  float hd = texture2D(uWet, uv - vec2(0.0, uTexel.y)).a;
  float hu = texture2D(uWet, uv + vec2(0.0, uTexel.y)).a;

  if (uWarm > 0.5) {
    float fog = texture2D(uFog, uv).a;
    float shower = step(1.5, uWarm);
    float fogNormal = mix(0.36, 0.42, shower);
    float fL = hl + texture2D(uFog, uv - vec2(uTexel.x, 0.0)).a * fogNormal;
    float fR = hr + texture2D(uFog, uv + vec2(uTexel.x, 0.0)).a * fogNormal;
    float fD = hd + texture2D(uFog, uv - vec2(0.0, uTexel.y)).a * fogNormal;
    float fU = hu + texture2D(uFog, uv + vec2(0.0, uTexel.y)).a * fogNormal;
    vec3 normal = normalize(vec3((fL - fR) * 18.0, (fD - fU) * 18.0, 1.0));

    vec2 center = uv * 2.0 - 1.0;
    vec2 edgeNormal = vec2(
      sign(center.x) * pow(abs(center.x), 12.0),
      sign(center.y) * pow(abs(center.y), 12.0)
    );
    edgeNormal /= max(length(edgeNormal), 0.0001);
    float edgeDistance = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    float edge = 1.0 - smoothstep(0.0, 0.07, edgeDistance);

    vec2 field = uv * vec2(6.0, 3.4);
    vec2 flow = vec2(
      sin(field.y * 2.9 + sin(field.x * 1.7 + uTime * 0.12)),
      cos(field.x * 2.4 + cos(field.y * 1.4 - uTime * 0.1))
    ) * mix(0.0015, 0.0007, shower) * fog;
    vec2 warped = uv + normal.xy * (mix(0.01, 0.008, shower) * fog + 0.02 * h) - edgeNormal * edge * 0.011 + flow;
    warped = clamp(warped, uTexel * 7.0, vec2(1.0) - uTexel * 7.0);

    vec2 blurOffset = uTexel * mix(2.5, mix(8.0, 10.0, shower), fog);
    vec3 color = mix(sceneAt(warped), blur5(warped, blurOffset), fog * 0.95);
    vec2 split = (normal.xy + edgeNormal * edge * 0.5) * (0.001 + edge * 0.0017) * max(fog, h);
    float chroma = (0.18 + edge * 0.4) * max(fog, h);
    color.r = mix(color.r, sceneAt(warped + split).r, chroma);
    color.b = mix(color.b, sceneAt(warped - split).b, chroma);

    vec3 light = normalize(vec3(-0.45, 0.55, 1.0));
    float fresnel = clamp(edge * 0.62 + smoothstep(0.015, 0.35, length(normal.xy)) * max(fog, h), 0.0, 1.0);
    float specular = pow(max(dot(normal, light), 0.0), 42.0) * max(fog, h);
    vec3 wetLight = mix(vec3(1.0, 0.91, 0.8), vec3(0.76, 1.0, 0.94), shower);
    vec3 fogTint = mix(vec3(0.94, 0.91, 0.87), vec3(0.86, 0.96, 0.93), shower);
    color += wetLight * (fresnel * 0.12 + specular * 0.48);
    color = mix(color, fogTint, fog * mix(0.14, 0.2, shower));
    color += wetLight * uBeat * 0.035;
    gl_FragColor = vec4(color, 1.0);
    return;
  }

  vec3 normal = normalize(vec3((hl - hr) * 20.0, (hd - hu) * 20.0, 1.0));
  vec2 warped = clamp(uv + normal.xy * uStrength * h, uTexel, vec2(1.0) - uTexel);
  vec2 split = normal.xy * uStrength * h * 0.32;
  vec3 color;
  color.r = sceneAt(warped + split).r;
  color.g = sceneAt(warped).g;
  color.b = sceneAt(warped - split).b;
  vec3 light = normalize(vec3(-0.45, 0.55, 1.0));
  float rim = smoothstep(0.025, 0.48, length(normal.xy)) * h;
  float specular = pow(max(dot(normal, light), 0.0), 48.0) * h;
  color -= vec3(0.05, 0.075, 0.08) * rim;
  color += vec3(0.56, 0.76, 0.82) * rim * 0.28;
  color += vec3(1.0, 0.98, 0.92) * specular * 0.9;
  color += vec3(0.82, 0.95, 1.0) * uBeat * 0.035;
  gl_FragColor = vec4(color, 1.0);
}`;

type Point = { x: number; y: number };
const SURFACE_SHAPES: Record<ThemeKey, { points: Point[]; divider: [number, number] }> = {
  frost: {
    points: [
      { x: 210, y: 66 },
      { x: 1123, y: 66 },
      { x: 1126, y: 90 },
      { x: 1128, y: 120 },
      { x: 1134, y: 160 },
      { x: 1145, y: 220 },
      { x: 1165, y: 300 },
      { x: 1199, y: 360 },
      { x: 1215, y: 420 },
      { x: 1199, y: 500 },
      { x: 1180, y: 560 },
      { x: 1177, y: 580 },
      { x: 1172, y: 620 },
      { x: 1169, y: 665 },
      { x: 175, y: 665 },
      { x: 172, y: 620 },
      { x: 167, y: 580 },
      { x: 165, y: 560 },
      { x: 156, y: 500 },
      { x: 139, y: 420 },
      { x: 148, y: 360 },
      { x: 170, y: 300 },
      { x: 190, y: 220 },
      { x: 200, y: 160 },
      { x: 205, y: 120 },
      { x: 208, y: 90 },
    ],
    divider: [66, 665],
  },
  mist: {
    points: [
      { x: 10, y: 174 },
      { x: 18, y: 145 },
      { x: 54, y: 120 },
      { x: 111, y: 104 },
      { x: 198, y: 92 },
      { x: 351, y: 84 },
      { x: 640, y: 79 },
      { x: 929, y: 84 },
      { x: 1082, y: 95 },
      { x: 1174, y: 111 },
      { x: 1232, y: 134 },
      { x: 1267, y: 169 },
      { x: 1273, y: 320 },
      { x: 1265, y: 441 },
      { x: 1238, y: 529 },
      { x: 1190, y: 580 },
      { x: 1148, y: 612 },
      { x: 1010, y: 626 },
      { x: 822, y: 635 },
      { x: 640, y: 638 },
      { x: 453, y: 635 },
      { x: 268, y: 625 },
      { x: 122, y: 604 },
      { x: 76, y: 576 },
      { x: 42, y: 523 },
      { x: 20, y: 452 },
      { x: 10, y: 360 },
    ],
    divider: [79, 638],
  },
  shower: {
    points: [
      { x: 146, y: 57 },
      { x: 1130, y: 57 },
      { x: 1137, y: 59 },
      { x: 1140, y: 66 },
      { x: 1140, y: 574 },
      { x: 1137, y: 581 },
      { x: 1130, y: 583 },
      { x: 146, y: 583 },
      { x: 139, y: 581 },
      { x: 136, y: 574 },
      { x: 136, y: 66 },
      { x: 139, y: 59 },
    ],
    divider: [57, 583],
  },
};
type WetStroke = Point & { x2: number; y2: number; born: number; angle: number; energy: number };
type Drop = Point & {
  radius: number;
  speed: number;
  hold: number;
  phase: number;
  heightKey: string;
  history: Point[];
  sprite: Phaser.GameObjects.Image;
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const cssToken = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const isGestureTurn = (from: Point | undefined, to: Point, displacement: number) =>
  from !== undefined && displacement >= 24 && from.x * to.x + from.y * to.y < 0.64;
const nextDropGap = (theme: ThemeKey) =>
  theme === "frost"
    ? 520 + Math.random() * 260
    : theme === "shower"
      ? 320 + Math.random() * 220
      : 380 + Math.random() * 260;

function segmentPoints(from: Point, to: Point, gap = 7): Point[] {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const count = Math.max(1, Math.ceil(distance / gap));
  return Array.from({ length: count }, (_, index) => {
    const t = (index + 1) / count;
    return { x: Phaser.Math.Linear(from.x, to.x, t), y: Phaser.Math.Linear(from.y, to.y, t) };
  });
}

const frictionGap = (theme: ThemeKey, amount: number, pressure: number) =>
  (theme === "frost"
    ? 30 - clamp(amount) * 13
    : theme === "shower"
      ? 44 - clamp(amount) * 18
      : 40 - clamp(amount) * 19) *
  (1.08 - clamp(pressure) * 0.18);

if (import.meta.env.DEV) {
  const check = segmentPoints({ x: 0, y: 0 }, { x: 30, y: 0 });
  const dropCheck = dropletPoints(0);
  console.assert(check.length === 5 && check.at(-1)?.x === 30, "문지르기 보간이 끊어졌습니다.");
  console.assert(
    Math.abs(frictionGap("mist", 1, 1) - 18.9) < 0.001 && Math.abs(frictionGap("frost", 0, 1) - 27) < 0.001,
    "문지름 소리 간격 보정이 틀어졌습니다.",
  );
  console.assert(
    Object.values(RHYTHMS).every(
      (stage) =>
        stage.levels.length === 5 &&
        stage.levels.every(
          (level) =>
            level.length === 3 &&
            level.every(
              (phrase) =>
                phrase.beats === 4 &&
                phrase.hits.length > 0 &&
                phrase.hits.every(
                  (tick, index) => tick >= 0 && tick < phrase.beats * RHYTHM_TICKS && (index === 0 || tick > phrase.hits[index - 1]),
                ),
            ),
        ),
    ),
    "3단계 × 5레벨 × 3문제 리듬 차트가 틀어졌습니다.",
  );
  console.assert(
    scoreRhythmHit(RHYTHMS.frost.perfect, RHYTHMS.frost) === 100 &&
      scoreRhythmHit(RHYTHMS.frost.good, RHYTHMS.frost) === 70 &&
      scoreRhythmHit(RHYTHMS.frost.good + 0.001, RHYTHMS.frost) === 0,
    "리듬 판정 경계가 틀어졌습니다.",
  );
  console.assert(
    isGestureTurn({ x: 1, y: 0 }, { x: 0, y: 1 }, 24) && !isGestureTurn({ x: 1, y: 0 }, { x: 0.9, y: 0.44 }, 24),
    "꺾인 획 구분이 틀어졌습니다.",
  );
  console.assert(
    Object.values(SURFACE_SHAPES).every((shape) =>
      shape.points.every(
        ({ x, y }) => x >= GLASS.x && x <= GLASS.x + GLASS.width && y >= GLASS.y && y <= GLASS.y + GLASS.height,
      ),
    ),
    "유리 윤곽이 렌더 영역 밖으로 나갔습니다.",
  );
  console.assert(dropCheck.length === 12 && dropCheck.every((point) => point.x > 24 && point.x < 168), "물방울 실루엣이 틀어졌습니다.");
}

function randomFrom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function addCanvasTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext("2d", { alpha: true })!);
  const texture = scene.textures.addCanvas(key, canvas);
  if (!texture) throw new Error(`텍스처를 만들 수 없습니다: ${key}`);
  return texture;
}

function drawCover(context: CanvasRenderingContext2D, source: HTMLImageElement) {
  const sourceWidth = source.naturalWidth;
  const sourceHeight = source.naturalHeight;
  const targetRatio = GLASS.width / GLASS.height;
  const sourceRatio = sourceWidth / sourceHeight;
  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / targetRatio;
    sy = (sourceHeight - sh) / 2;
  }
  context.drawImage(source, sx, sy, sw, sh, 0, 0, GLASS.width, GLASS.height);
}

function drawGameGlassCrop(context: CanvasRenderingContext2D, source: HTMLImageElement) {
  const scaleX = source.naturalWidth / GAME.width;
  const scaleY = source.naturalHeight / GAME.height;
  context.drawImage(
    source,
    GLASS.x * scaleX,
    GLASS.y * scaleY,
    GLASS.width * scaleX,
    GLASS.height * scaleY,
    0,
    0,
    GLASS.width,
    GLASS.height,
  );
}

function paintBrush(context: CanvasRenderingContext2D) {
  const radius = context.canvas.width / 2;
  const brush = context.createRadialGradient(radius, radius, radius * 0.38, radius, radius, radius);
  brush.addColorStop(0, "rgba(255, 255, 255, 1)");
  brush.addColorStop(0.67, "rgba(255, 255, 255, .98)");
  brush.addColorStop(0.88, "rgba(255, 255, 255, .72)");
  brush.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = brush;
  context.fillRect(0, 0, radius * 2, radius * 2);
}

function paintMist(context: CanvasRenderingContext2D, shower = false) {
  const random = randomFrom(shower ? 8093 : 8026);
  const { width, height } = context.canvas;
  const base = context.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, shower ? "rgba(235, 247, 244, .84)" : "rgba(248, 242, 234, .72)");
  base.addColorStop(0.52, shower ? "rgba(205, 224, 220, .76)" : "rgba(220, 213, 204, .64)");
  base.addColorStop(1, shower ? "rgba(158, 187, 181, .8)" : "rgba(189, 179, 168, .68)");
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  context.save();
  context.globalCompositeOperation = "destination-out";
  for (let index = 0; index < (shower ? 18 : 24); index += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = 55 + random() * 150;
    const opening = context.createRadialGradient(x, y, 0, x, y, radius);
    opening.addColorStop(0, `rgba(0, 0, 0, ${shower ? 0.06 + random() * 0.1 : 0.1 + random() * 0.14})`);
    opening.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = opening;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  context.restore();

  for (let index = 0; index < (shower ? 18 : 14); index += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = 70 + random() * 130;
    const fog = context.createRadialGradient(x, y, 0, x, y, radius);
    fog.addColorStop(
      0,
      shower
        ? `rgba(235, 255, 251, ${0.045 + random() * 0.065})`
        : `rgba(255, 248, 238, ${0.035 + random() * 0.055})`,
    );
    fog.addColorStop(1, shower ? "rgba(235, 255, 251, 0)" : "rgba(255, 248, 238, 0)");
    context.fillStyle = fog;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  context.save();
  context.lineCap = "round";
  context.filter = "blur(3px)";
  for (let index = 0; index < (shower ? 10 : 7); index += 1) {
    const x = 50 + random() * (width - 100);
    const y = random() * height * 0.45;
    context.strokeStyle = shower
      ? `rgba(45, 82, 76, ${0.025 + random() * 0.035})`
      : `rgba(75, 56, 43, ${0.025 + random() * 0.03})`;
    context.lineWidth = 5 + random() * 10;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(x - 10, y + 50, x + 14, y + 110, x + (random() - 0.5) * 20, y + 170 + random() * 120);
    context.stroke();
  }
  context.restore();

  for (let index = 0; index < (shower ? 96 : 54); index += 1) {
    const x = 8 + random() * (width - 16);
    const y = 8 + random() * (height - 16);
    const radius = 0.7 + random() ** 1.8 * 2.8;
    context.fillStyle = shower ? "rgba(238, 255, 252, .1)" : "rgba(255, 252, 246, .08)";
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = shower ? "rgba(35, 72, 67, .14)" : "rgba(62, 47, 37, .12)";
    context.lineWidth = 0.65;
    context.stroke();
  }
}

function paintRidge(context: CanvasRenderingContext2D, mist = false, shower = false) {
  const random = randomFrom(44);
  const points = Array.from({ length: 17 }, (_, index) => ({
    x: 4 + index * 5.5,
    y: 15 + (random() - 0.5) * (mist ? 2.2 : 3.2),
  }));

  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = shower ? "rgba(7, 42, 38, .24)" : mist ? "rgba(45, 26, 17, .28)" : "rgba(14, 43, 53, .45)";
  context.shadowBlur = mist ? 3 : 5;
  context.strokeStyle = shower ? "rgba(35, 91, 83, .22)" : mist ? "rgba(86, 61, 44, .24)" : "rgba(56, 91, 103, .36)";
  context.lineWidth = mist ? 6 : 10;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y + 3);
  points.slice(1).forEach((point) => context.lineTo(point.x, point.y + 3));
  context.stroke();

  context.shadowBlur = mist ? 1 : 2;
  context.strokeStyle = shower
    ? "rgba(222, 255, 250, .52)"
    : mist
      ? "rgba(255, 237, 214, .54)"
      : "rgba(231, 246, 248, .82)";
  context.lineWidth = mist ? 1.8 : 4.2;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  context.stroke();

  if (!mist) {
    context.shadowBlur = 0;
    context.strokeStyle = "rgba(255, 255, 255, .58)";
    context.lineWidth = 1;
    context.setLineDash([11, 7]);
    context.beginPath();
    context.moveTo(points[0].x, points[0].y - 1.5);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y - 1.5));
    context.stroke();
    context.setLineDash([]);
  }

  for (let index = 0; index < (mist ? 3 : 6); index += 1) {
    const x = 5 + random() * 86;
    const y = 11 + random() * 9;
    const radius = 0.7 + random() * 1.6;
    context.fillStyle = mist
      ? shower
        ? `rgba(226, 255, 251, ${0.2 + random() * 0.2})`
        : `rgba(255, 239, 218, ${0.22 + random() * 0.22})`
      : `rgba(246, 255, 255, ${0.34 + random() * 0.34})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
}

function paintWetHeight(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const image = context.createImageData(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = (x + 0.5 - width / 2) / (width / 2);
      const ny = (y + 0.5 - height / 2) / (height / 2);
      const distance = nx * nx + ny * ny;
      if (distance >= 1) continue;
      const alpha = Math.pow(1 - distance, 0.62) * 255;
      const index = (y * width + x) * 4;
      image.data[index] = 255;
      image.data[index + 1] = 255;
      image.data[index + 2] = 255;
      image.data[index + 3] = alpha;
    }
  }
  context.putImageData(image, 0, 0);
}

function dropletPoints(variant: number): Point[] {
  const random = randomFrom(4100 + variant * 97);
  const width = 56 * (0.95 + (variant % 3) * 0.045);
  const height = 60 * (0.96 + ((variant + 1) % 3) * 0.04);
  return Array.from({ length: 12 }, (_, index) => {
    const angle = -Math.PI / 2 + (index / 12) * Math.PI * 2;
    const edge =
      0.84 +
      random() * 0.22 +
      Math.sin(angle * (2 + (variant % 2)) + variant * 0.83) * 0.09 +
      Math.cos(angle * 3 - variant * 0.61) * 0.055;
    return {
      x: 96 + Math.cos(angle) * width * edge,
      y: 96 + Math.sin(angle) * height * edge,
    };
  });
}

function dropletPath(context: CanvasRenderingContext2D, variant: number) {
  const points = dropletPoints(variant);
  const last = points.at(-1)!;
  context.beginPath();
  context.moveTo((last.x + points[0].x) / 2, (last.y + points[0].y) / 2);
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
  });
  context.closePath();
}

function paintDroplet(context: CanvasRenderingContext2D, variant: number) {
  const random = randomFrom(7200 + variant * 131);
  context.save();
  context.shadowColor = "rgba(8, 5, 3, .34)";
  context.shadowBlur = 15;
  context.shadowOffsetX = 10;
  context.shadowOffsetY = 14;
  context.fillStyle = "rgba(255, 255, 255, .025)";
  dropletPath(context, variant);
  context.fill();
  context.restore();

  const body = context.createLinearGradient(48, 42, 150, 154);
  body.addColorStop(0, "rgba(255, 255, 255, .15)");
  body.addColorStop(0.34, "rgba(255, 255, 255, .018)");
  body.addColorStop(0.68, "rgba(58, 43, 33, .045)");
  body.addColorStop(1, "rgba(10, 7, 5, .15)");
  context.fillStyle = body;
  dropletPath(context, variant);
  context.fill();

  context.save();
  dropletPath(context, variant);
  context.clip();
  context.shadowColor = "rgba(4, 3, 2, .34)";
  context.shadowBlur = 17;
  context.shadowOffsetX = 11;
  context.shadowOffsetY = 12;
  context.strokeStyle = "rgba(15, 10, 7, .16)";
  context.lineWidth = 10;
  dropletPath(context, variant);
  context.stroke();
  context.shadowColor = "rgba(255, 255, 255, .7)";
  context.shadowBlur = 13;
  context.shadowOffsetX = -9;
  context.shadowOffsetY = -9;
  context.strokeStyle = "rgba(255, 255, 255, .11)";
  context.lineWidth = 8;
  dropletPath(context, variant);
  context.stroke();
  context.restore();

  const rim = context.createLinearGradient(48, 42, 148, 154);
  rim.addColorStop(0, "rgba(255, 255, 255, .62)");
  rim.addColorStop(0.38, "rgba(255, 255, 255, .08)");
  rim.addColorStop(0.67, "rgba(65, 49, 38, .16)");
  rim.addColorStop(1, "rgba(8, 5, 3, .58)");
  context.strokeStyle = rim;
  context.lineWidth = 3;
  dropletPath(context, variant);
  context.stroke();

  const highlightX = 66 + (random() - 0.5) * 9;
  const highlightY = 58 + (random() - 0.5) * 8;
  context.save();
  context.translate(highlightX, highlightY);
  context.rotate(-0.45 + (random() - 0.5) * 0.24);
  context.fillStyle = "rgba(255, 255, 255, .9)";
  context.beginPath();
  context.ellipse(0, 0, 10 + random() * 3, 6 + random() * 2, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.fillStyle = "rgba(255, 255, 255, .94)";
  context.beginPath();
  context.ellipse(94 + (random() - 0.5) * 7, 52 + (random() - 0.5) * 6, 4.5, 3.2, -0.35, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(255, 248, 237, .66)";
  context.lineWidth = 3;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(112 + (random() - 0.5) * 5, 140);
  context.quadraticCurveTo(130, 151 + random() * 4, 146, 129 + (random() - 0.5) * 7);
  context.stroke();
}

function paintDropletHeight(context: CanvasRenderingContext2D, variant: number) {
  const height = context.createRadialGradient(78, 75, 4, 96, 96, 78);
  height.addColorStop(0, "rgba(255, 255, 255, .98)");
  height.addColorStop(0.56, "rgba(255, 255, 255, .72)");
  height.addColorStop(0.84, "rgba(255, 255, 255, .2)");
  height.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = height;
  dropletPath(context, variant);
  context.fill();
}

class FrostScene extends Phaser.Scene {
  private frost!: Phaser.Textures.DynamicTexture;
  private waterMap!: Phaser.Textures.DynamicTexture;
  private stageBackdrop!: Phaser.GameObjects.Image;
  private stageForeground!: Phaser.GameObjects.Image;
  private ambientLayer!: Phaser.GameObjects.Graphics;
  private surfaceLayer!: Phaser.GameObjects.Layer;
  private dropLayer!: Phaser.GameObjects.Container;
  private surfaceMaskShape!: Phaser.GameObjects.Graphics;
  private surfaceMaskFilter!: Phaser.Filters.Mask;
  private surfacePolygon = new Phaser.Geom.Polygon(SURFACE_SHAPES.frost.points);
  private divider!: Phaser.GameObjects.Graphics;
  private glassShader!: Phaser.GameObjects.Shader;
  private blurred!: Phaser.GameObjects.Image;
  private glassOverlay!: Phaser.GameObjects.Image;
  private wetLayer!: Phaser.GameObjects.Graphics;
  private phaseOverlay!: Phaser.GameObjects.Graphics;
  private beatFlash!: Phaser.GameObjects.Graphics;
  private hitBurst!: Phaser.GameObjects.Graphics;
  private finger!: Phaser.GameObjects.Image;
  private guideFinger!: Phaser.GameObjects.Image;
  private contact!: Phaser.GameObjects.Ellipse;
  private theme: ThemeKey = "frost";
  private rubbing = false;
  private lastPoint: Point = { x: 0, y: 0 };
  private lastMoveAt = 0;
  private dropDistance = 0;
  private nextDropDistance = nextDropGap("frost");
  private strokes: WetStroke[] = [];
  private drops: Drop[] = [];
  private wetSurfaceActive = false;
  private playing = false;
  private completedLevels = [0, 0, 0];
  private stageFinished = false;
  private levelIndex = 0;
  private phraseIndex = 0;
  private rhythmPhase: RhythmPhase = "idle";
  private rhythmToken = 0;
  private expectedTimes: number[] = [];
  private matchedTimes: boolean[] = [];
  private phrasePoints = 0;
  private phraseMax = 0;
  private phraseExtras = 0;
  private levelPoints = 0;
  private levelMax = 0;
  private responseStart = 0;
  private responseEnd = 0;
  private phaseStart = 0;
  private phaseEnd = 0;
  private strokeDirection?: Point;
  private strokeAnchor?: Point;
  private gestureHitMade = false;
  private lastRhythmHitAt = 0;
  private scheduledSources: AudioScheduledSourceNode[] = [];
  private menu?: HTMLElement;
  private gameElement?: HTMLElement;
  private resetButton?: HTMLButtonElement;
  private backButton?: HTMLButtonElement;
  private stageChip?: HTMLElement;
  private clearPanel?: HTMLElement;
  private clearCopy?: HTMLElement;
  private clearNext?: HTMLButtonElement;
  private clearMenu?: HTMLButtonElement;
  private rhythmHud?: HTMLElement;
  private phaseChip?: HTMLElement;
  private levelProgress?: HTMLElement;
  private rhythmPrompt?: HTMLElement;
  private rhythmTimeline?: HTMLElement;
  private judgePop?: HTMLElement;
  private squeakTravel = 0;
  private lastSqueakAt = 0;
  private lastFoleyAt = 0;
  private audioAmount = 0;
  private beatEnergy = 0;
  private audioReady?: Promise<void>;
  private audio?: {
    context: AudioContext;
    source: AudioBufferSourceNode;
    squeakTone: OscillatorNode;
    bodyFilter: BiquadFilterNode;
    squeakFilter: BiquadFilterNode;
    bodyGain: GainNode;
    squeakGain: GainNode;
    toneGain: GainNode;
    master: GainNode;
    foley: Record<ThemeKey, AudioBuffer[]>;
    rubberHit?: AudioBuffer;
  };

  constructor() {
    super("frost");
  }

  preload() {
    this.load.image("frost-handdrawn", "/assets/stage-frost-background.webp");
    this.load.image("mist-handdrawn", "/assets/stage-mist-background.webp");
    this.load.image("shower-handdrawn", "/assets/stage-shower-background.webp");
    this.load.image("frost-foreground", "/assets/stage-frost-foreground.webp");
    this.load.image("mist-foreground", "/assets/stage-mist-foreground.webp");
    this.load.image("shower-foreground", "/assets/stage-shower-foreground.webp");
    this.load.image("frost-photo", "/assets/wet-frost.webp");
    this.load.image("finger-photo", "/assets/finger-handdrawn.webp");
    this.load.binary("foley-frost-scrape", "/audio/foley/frost-scrape.mp3");
    this.load.binary("foley-frost-squeak", "/audio/foley/frost-squeak.mp3");
    this.load.binary("foley-mist", "/audio/foley/mist-wet-glass.mp3");
    this.load.binary("foley-rubber-hit", "/audio/foley/rubber-hit.mp3");
    this.load.binary("foley-shower-wet", "/audio/foley/shower-wet-glass.mp3");
    this.load.binary("foley-shower-wipe", "/audio/foley/shower-wipe.mp3");
  }

  create() {
    this.completedLevels = this.loadProgress();
    this.cameras.main.setBackgroundColor(cssToken("--stage-camera"));
    this.createTextures();
    this.drawStage();
    this.bindInput();
    this.applyTheme(false);
    this.syncStageCards();
    this.showMenu();
  }

  private createTextures() {
    const winter = this.textures.get("frost-handdrawn").getSourceImage() as HTMLImageElement;
    const warmRain = this.textures.get("mist-handdrawn").getSourceImage() as HTMLImageElement;
    const shower = this.textures.get("shower-handdrawn").getSourceImage() as HTMLImageElement;
    const frostForeground = this.textures.get("frost-foreground").getSourceImage() as HTMLImageElement;
    const mistForeground = this.textures.get("mist-foreground").getSourceImage() as HTMLImageElement;
    const showerForeground = this.textures.get("shower-foreground").getSourceImage() as HTMLImageElement;
    const frostPhoto = this.textures.get("frost-photo").getSourceImage() as HTMLImageElement;
    if (import.meta.env.DEV) {
      console.assert(
        [winter, warmRain, shower, frostForeground, mistForeground, showerForeground].every(
          (image) => image.naturalWidth === GAME.width && image.naturalHeight === GAME.height,
        ),
        "POV 원화는 게임 좌표와 같은 1280×720이어야 유리 크롭이 맞습니다.",
      );
    }

    addCanvasTexture(this, "winter-view", GLASS.width, GLASS.height, (context) => {
      context.filter = "saturate(.92) contrast(1.02) brightness(.94)";
      drawGameGlassCrop(context, winter);
    });
    addCanvasTexture(this, "mist-view", GLASS.width, GLASS.height, (context) => {
      context.filter = "saturate(.94) contrast(1.01) brightness(.92)";
      drawGameGlassCrop(context, warmRain);
    });
    addCanvasTexture(this, "shower-view", GLASS.width, GLASS.height, (context) => {
      context.filter = "saturate(.92) contrast(1.01) brightness(.92)";
      drawGameGlassCrop(context, shower);
    });
    addCanvasTexture(this, "frost-source", GLASS.width, GLASS.height, (context) => {
      context.filter = "saturate(.6) contrast(.94) brightness(1.1)";
      drawCover(context, frostPhoto);
      context.filter = "none";
      const haze = context.createLinearGradient(0, 0, GLASS.width, GLASS.height);
      haze.addColorStop(0, "rgba(225, 240, 244, .22)");
      haze.addColorStop(0.5, "rgba(182, 207, 216, .08)");
      haze.addColorStop(1, "rgba(116, 151, 163, .13)");
      context.fillStyle = haze;
      context.fillRect(0, 0, GLASS.width, GLASS.height);
    });
    addCanvasTexture(this, "mist-source", GLASS.width, GLASS.height, paintMist);
    addCanvasTexture(this, "shower-source", GLASS.width, GLASS.height, (context) => paintMist(context, true));
    addCanvasTexture(this, "frost-brush", BRUSH_RADIUS * 2, BRUSH_RADIUS * 2, paintBrush);
    addCanvasTexture(this, "guide-brush", 58, 58, paintBrush);
    addCanvasTexture(this, "frost-ridge", 96, 30, (context) => paintRidge(context));
    addCanvasTexture(this, "mist-ridge", 96, 30, (context) => paintRidge(context, true));
    addCanvasTexture(this, "shower-ridge", 96, 30, (context) => paintRidge(context, true, true));
    addCanvasTexture(this, "wet-height", 128, 128, paintWetHeight);
    for (let variant = 0; variant < DROP_VARIANTS; variant += 1) {
      addCanvasTexture(this, `drop-gloss-${variant}`, 192, 192, (context) => paintDroplet(context, variant));
      addCanvasTexture(this, `drop-height-${variant}`, 192, 192, (context) => paintDropletHeight(context, variant));
    }

    const frost = this.textures.addDynamicTexture("frost-live", GLASS.width, GLASS.height);
    const waterMap = this.textures.addDynamicTexture("wet-map", GLASS.width, GLASS.height);
    if (!frost || !waterMap) throw new Error("유리 렌더 텍스처를 만들 수 없습니다.");
    this.frost = frost.draw(THEMES[this.theme].source, GLASS.width / 2, GLASS.height / 2).render();
    this.waterMap = waterMap.clear().render();
  }

  private drawStage() {
    const theme = THEMES[this.theme];
    this.stageBackdrop = this.add
      .image(GAME.width / 2, GAME.height / 2, theme.backdrop)
      .setDisplaySize(GAME.width, GAME.height)
      .setDepth(-2);
    this.ambientLayer = this.add.graphics();
    this.surfaceMaskShape = this.make.graphics({}, false);
    this.surfaceLayer = this.add.layer().setDepth(1);

    this.glassShader = this.add.shader(
        {
          name: "WetGlassScene",
          fragmentSource: WET_GLASS_SHADER,
          initialUniforms: {
            uScene: 0,
            uWet: 1,
            uFog: 2,
            uTexel: [1 / GLASS.width, 1 / GLASS.height],
            uStrength: 0.018,
            uWarm: theme.warm,
            uTime: 0,
            uBeat: 0,
          },
        },
        GLASS.x + GLASS.width / 2,
        GLASS.y + GLASS.height / 2,
        GLASS.width,
        GLASS.height,
        [theme.view, "wet-map", "frost-live"],
      );

    this.blurred = this.add.image(GLASS.x, GLASS.y, theme.view).setOrigin(0).enableFilters();
    this.blurred.filters?.internal.addBlur(1, 2, 2, 1.25, 0xffffff, 3);
    this.blurred.filters?.internal.addMask("frost-live");

    this.glassOverlay = this.add.image(GLASS.x, GLASS.y, "frost-live").setOrigin(0).setAlpha(theme.overlayAlpha);
    this.wetLayer = this.add.graphics();
    this.phaseOverlay = this.add.graphics();
    this.dropLayer = this.add.container();
    this.beatFlash = this.add.graphics().setAlpha(0);
    this.surfaceLayer.add([
      this.glassShader,
      this.blurred,
      this.glassOverlay,
      this.ambientLayer,
      this.wetLayer,
      this.phaseOverlay,
      this.dropLayer,
      this.beatFlash,
    ]);
    this.surfaceLayer.enableFilters();
    if (!this.surfaceLayer.filters) throw new Error("유리 윤곽 마스크를 만들 수 없습니다.");
    this.surfaceMaskFilter = this.surfaceLayer.filters.external.addMask(this.surfaceMaskShape, false, this.cameras.main);
    this.surfaceMaskFilter.autoUpdate = false;
    this.stageForeground = this.add
      .image(GAME.width / 2, GAME.height / 2, `${this.theme}-foreground`)
      .setDisplaySize(GAME.width, GAME.height)
      .setDepth(8.8);
    this.divider = this.add.graphics().setDepth(9);
    this.drawSurfaceFrame();

    this.add
      .text(GLASS.x + GLASS.width * 0.25, 142, "\u2460 \uB4E3\uAE30", {
        fontFamily: cssToken("--font-ui"),
        fontSize: "14px",
        fontStyle: "700",
        color: "#fff0cf",
        stroke: "#263235",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(10);
    this.add
      .text(GLASS.x + GLASS.width * 0.75, 142, "\u2461 \uB530\uB77C \uD558\uAE30", {
        fontFamily: cssToken("--font-ui"),
        fontSize: "14px",
        fontStyle: "700",
        color: "#fff0cf",
        stroke: "#263235",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(10);
    this.contact = this.add.ellipse(GLASS.x, GLASS.y, 88, 35, 0xffedc7, 0.12).setDepth(10).setVisible(false);
    this.contact.setStrokeStyle(2, 0xfff8e6, 0.62);
    this.finger = this.add
      .image(GLASS.x, GLASS.y, "finger-photo")
      .setOrigin(0.5, 0.986)
      .setDisplaySize(112, 210)
      .setDepth(11)
      .setVisible(false);
    this.guideFinger = this.add
      .image(GLASS.x, GLASS.y, "finger-photo")
      .setOrigin(0.5, 0.986)
      .setDisplaySize(96, 180)
      .setTint(0xfff1c9)
      .setBlendMode(Phaser.BlendModes.SCREEN)
      .setAlpha(0.46)
      .setDepth(11)
      .setVisible(false);
    this.hitBurst = this.add.graphics().setDepth(10.5).setAlpha(0);
  }

  private bindInput() {
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.startRub, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.moveRub, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.stopRub, this);
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.stopRub, this);

    this.menu = document.querySelector<HTMLElement>("#menu") ?? undefined;
    this.gameElement = document.querySelector<HTMLElement>("#game") ?? undefined;
    this.resetButton = document.querySelector<HTMLButtonElement>("#reset") ?? undefined;
    this.backButton = document.querySelector<HTMLButtonElement>("#back") ?? undefined;
    this.stageChip = document.querySelector<HTMLElement>("#stage-chip") ?? undefined;
    this.clearPanel = document.querySelector<HTMLElement>("#clear-panel") ?? undefined;
    this.clearCopy = document.querySelector<HTMLElement>("#clear-copy") ?? undefined;
    this.clearNext = document.querySelector<HTMLButtonElement>("#clear-next") ?? undefined;
    this.clearMenu = document.querySelector<HTMLButtonElement>("#clear-menu") ?? undefined;
    this.rhythmHud = document.querySelector<HTMLElement>("#rhythm-hud") ?? undefined;
    this.phaseChip = document.querySelector<HTMLElement>("#phase-chip") ?? undefined;
    this.levelProgress = document.querySelector<HTMLElement>("#level-progress") ?? undefined;
    this.rhythmPrompt = document.querySelector<HTMLElement>("#rhythm-prompt") ?? undefined;
    this.rhythmTimeline = document.querySelector<HTMLElement>("#rhythm-timeline") ?? undefined;
    this.judgePop = document.querySelector<HTMLElement>("#judge-pop") ?? undefined;
    this.resetButton?.addEventListener("click", this.restartLevel);
    this.backButton?.addEventListener("click", this.showMenu);
    this.menu?.addEventListener("click", this.handleMenuClick);
    this.clearNext?.addEventListener("click", this.handleClearNext);
    this.clearMenu?.addEventListener("click", this.showMenu);
    this.gameElement?.addEventListener("keydown", this.handleGameKeydown);
    PORTRAIT_GAME.addEventListener("change", this.handleOrientation);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.resetButton?.removeEventListener("click", this.restartLevel);
      this.backButton?.removeEventListener("click", this.showMenu);
      this.menu?.removeEventListener("click", this.handleMenuClick);
      this.clearNext?.removeEventListener("click", this.handleClearNext);
      this.clearMenu?.removeEventListener("click", this.showMenu);
      this.gameElement?.removeEventListener("keydown", this.handleGameKeydown);
      PORTRAIT_GAME.removeEventListener("change", this.handleOrientation);
      this.drops.forEach((drop) => drop.sprite.destroy());
      this.cancelRhythm();
      this.audio?.source.stop();
      this.audio?.squeakTone.stop();
      void this.audio?.context.close();
    });
  }

  private applyTheme(reset = true) {
    const theme = THEMES[this.theme];
    document.documentElement.dataset.theme = this.theme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", cssToken("--color-canvas"));
    this.cameras.main.setBackgroundColor(cssToken("--stage-camera"));
    this.stageBackdrop.setTexture(theme.backdrop);
    this.stageForeground.setTexture(`${this.theme}-foreground`);
    this.drawSurfaceFrame();
    this.glassShader.setTextures([theme.view, "wet-map", "frost-live"]);
    this.glassShader.setUniform("uWarm", theme.warm);
    this.blurred.setTexture(theme.view);
    this.blurred.setVisible(this.theme === "frost");
    this.glassOverlay.setAlpha(theme.overlayAlpha).setVisible(true);
    this.updateStageChip();
    if (this.resetButton) {
      this.resetButton.textContent = "레벨 다시 시작";
      this.resetButton.setAttribute("aria-label", "현재 레벨 다시 시작");
    }
    if (reset) this.resetSurface();
  }

  private drawSurfaceFrame() {
    const shape = SURFACE_SHAPES[this.theme];
    this.surfacePolygon.setTo(shape.points);
    const mask = this.surfaceMaskShape.clear().fillStyle(0xffffff, 1).beginPath();
    mask.moveTo(shape.points[0].x, shape.points[0].y);
    shape.points.slice(1).forEach((point) => mask.lineTo(point.x, point.y));
    mask.closePath().fillPath();
    if (this.surfaceMaskFilter) this.surfaceMaskFilter.needsUpdate = true;

    const divider = this.divider.clear();
    const color = this.theme === "frost" ? 0x4b372c : this.theme === "mist" ? 0x18151a : 0x174c48;
    const highlight = this.theme === "frost" ? 0xf2d5a7 : this.theme === "mist" ? 0xa67592 : 0xc9f0e2;
    const width = this.theme === "frost" ? 7 : this.theme === "mist" ? 3 : 5;
    divider.lineStyle(width, color, 0.88);
    divider.lineBetween(GAME.width / 2, shape.divider[0], GAME.width / 2, shape.divider[1]);
    divider.lineStyle(1, highlight, 0.48);
    divider.lineBetween(GAME.width / 2 + 1, shape.divider[0] + 8, GAME.width / 2 + 1, shape.divider[1] - 8);
  }

  private drawAmbient(time: number) {
    const layer = this.ambientLayer;
    const motion = time * (REDUCED_MOTION.matches ? 0.12 : 1);
    const pulse = this.beatEnergy;
    const frame = Math.floor(motion * 9);
    const boil = (frame % 3) - 1;
    layer.clear();
    if (!this.playing) return;

    if (this.theme === "frost") {
      layer.lineStyle(1.4, 0xfff4d7, 0.15 + pulse * 0.12);
      for (let index = 0; index < 10; index += 1) {
        const x = 34 + ((index * 173 + frame * (1 + (index % 3))) % (GAME.width - 68));
        const y = -16 + ((index * 97 + frame * (2 + (index % 2))) % (GAME.height + 32));
        const radius = 2.4 + (index % 3);
        layer.lineBetween(x - radius, y + boil * 0.4, x + radius, y - boil * 0.4);
        layer.lineBetween(x + boil * 0.4, y - radius, x - boil * 0.4, y + radius);
        if (index % 2 === 0) layer.lineBetween(x - radius * 0.7, y - radius * 0.7, x + radius * 0.7, y + radius * 0.7);
      }

      layer.lineStyle(3, 0xfff5df, 0.09 + pulse * 0.11);
      for (let stroke = 0; stroke < 3; stroke += 1) {
        layer.beginPath();
        for (let step = 0; step < 7; step += 1) {
          const y = 218 - step * 18 - ((frame * 2 + stroke * 13) % 28);
          const x = 1068 + Math.sin(step * 0.9 + frame * 0.14 + stroke) * (6 + step * 1.4) + boil;
          if (step === 0) layer.moveTo(x, y);
          else layer.lineTo(x, y);
        }
        layer.strokePath();
      }
      if (pulse > 0.18) {
        layer.lineStyle(2, 0xffeaa7, 0.25 + pulse * 0.4);
        const radius = 4 + pulse * 4;
        layer.lineBetween(258 - radius, 580, 258 + radius, 580);
        layer.lineBetween(258, 580 - radius, 258, 580 + radius);
        layer.lineBetween(1098 - radius, 568, 1098 + radius, 568);
        layer.lineBetween(1098, 568 - radius, 1098, 568 + radius);
        layer.lineStyle(2, 0xfff2c8, 0.22 + pulse * 0.34);
        layer.beginPath().arc(790, 216, 9 + boil, Math.PI * 1.1, Math.PI * 1.85).strokePath();
        layer.beginPath().arc(820, 215, 9 - boil, Math.PI * 1.15, Math.PI * 1.9).strokePath();
      }
      return;
    }

    if (this.theme === "mist") {
      layer.lineStyle(1.6, 0xb9d8dd, 0.1 + pulse * 0.08);
      for (let index = 0; index < 11; index += 1) {
        const x = -70 + ((index * 181 + frame * 7) % (GAME.width + 140));
        const y = -50 + ((index * 109 + frame * 11) % (GAME.height + 100));
        const length = 21 + (index % 3) * 8;
        layer.lineBetween(x + boil, y, x + 8 + boil, y + length);
      }

      layer.lineStyle(2.5, 0xffd477, 0.12 + pulse * 0.18);
      layer.strokeCircle(848 + boil, 177, 24 + pulse * 8);
      layer.lineStyle(2.5, 0xff705b, 0.14 + pulse * 0.28);
      layer.strokeCircle(628, 260, 8 + pulse * 5);
      for (let light = 0; light < 2; light += 1) {
        const baseX = light === 0 ? 686 : 748;
        layer.beginPath().moveTo(baseX + boil, 424);
        for (let step = 1; step < 7; step += 1) {
          const y = 424 + step * 21;
          const x = baseX + Math.sin(step * 1.7 + frame * 0.28 + light) * (2 + step * 0.8);
          layer.lineTo(x, y);
        }
        layer.strokePath();
      }
      return;
    }

    layer.lineStyle(3, 0xe9fff4, 0.08 + pulse * 0.09);
    for (let curl = 0; curl < 5; curl += 1) {
      layer.beginPath();
      for (let step = 0; step < 8; step += 1) {
        const y = 612 - ((curl * 91 + frame * 3 + step * 15) % 440);
        const x = 260 + curl * 168 + Math.sin(step * 0.95 + frame * 0.12 + curl) * (9 + step * 1.2);
        if (step === 0) layer.moveTo(x, y);
        else layer.lineTo(x, y);
      }
      layer.strokePath();
    }
    layer.fillStyle(0xcffff3, 0.13 + pulse * 0.11);
    for (let drop = 0; drop < 6; drop += 1) {
      const x = 238 + drop * 11 + boil;
      const y = 244 + ((frame * 8 + drop * 23) % 126);
      layer.fillEllipse(x, y, 2.2, 5 + (drop % 2) * 2);
    }
    if (pulse > 0.2) {
      layer.lineStyle(2, 0xffcf75, 0.28 + pulse * 0.38);
      layer.beginPath().arc(940, 252, 26 + pulse * 5, -0.65, 0.2).strokePath();
      layer.beginPath().arc(940, 252, 26 + pulse * 5, Math.PI - 0.2, Math.PI + 0.65).strokePath();
      layer.lineStyle(2, 0xe8fff7, 0.2 + pulse * 0.3);
      layer.lineBetween(776 + boil, 214, 770 - boil, 205);
      layer.lineBetween(795 - boil, 220, 803 + boil, 210);
    }
  }

  private pulseCue() {
    this.beatEnergy = 1;
    this.tweens.killTweensOf(this.beatFlash);
    this.beatFlash.clear();
    this.beatFlash.fillStyle(0xffedc4, 0.12);
    this.beatFlash.fillRoundedRect(GLASS.x + 6, GLASS.y + 6, GLASS.width / 2 - 12, GLASS.height - 12, 10);
    this.beatFlash.lineStyle(3, 0xfff2d3, 0.82);
    this.beatFlash.strokeRoundedRect(GLASS.x + 7, GLASS.y + 7, GLASS.width / 2 - 14, GLASS.height - 14, 9);
    this.beatFlash.setAlpha(1);
    this.tweens.add({
      targets: this.beatFlash,
      alpha: 0,
      duration: REDUCED_MOTION.matches ? 120 : 230,
      ease: "Sine.Out",
    });
  }

  private pulseHit(kind: "perfect" | "good" | "miss", feedbackPoint?: Point) {
    this.playJudgeFoley(kind);
    const color = kind === "perfect" ? 0xffe78a : kind === "good" ? 0xbef8e8 : 0xff9b87;
    const radius = kind === "perfect" ? 30 : kind === "good" ? 25 : 21;
    const point = feedbackPoint ?? this.input.activePointer;
    this.beatEnergy = Math.max(this.beatEnergy, kind === "perfect" ? 1 : 0.72);
    this.tweens.killTweensOf(this.hitBurst);
    this.hitBurst.clear();
    this.hitBurst.fillStyle(color, 0.16);
    this.hitBurst.fillCircle(0, 0, radius * 0.68);
    this.hitBurst.lineStyle(kind === "miss" ? 4 : 3, color, 0.96);
    this.hitBurst.strokeCircle(0, 0, radius);
    this.hitBurst
      .setPosition(
        clamp(point.x, GAME.width / 2 + 10, GLASS.x + GLASS.width - 10),
        clamp(point.y, GLASS.y + 10, GLASS.y + GLASS.height - 10),
      )
      .setScale(REDUCED_MOTION.matches ? 1 : 0.72)
      .setAlpha(1);
    this.tweens.add({
      targets: this.hitBurst,
      alpha: 0,
      scaleX: REDUCED_MOTION.matches ? 1 : 1.65,
      scaleY: REDUCED_MOTION.matches ? 1 : 1.65,
      duration: REDUCED_MOTION.matches ? 130 : 260,
      ease: "Sine.Out",
    });
  }

  private resetVisualFeedback() {
    this.beatEnergy = 0;
    if (!this.sys.isActive()) return;
    this.tweens.killTweensOf(this.beatFlash);
    this.tweens.killTweensOf(this.hitBurst);
    this.ambientLayer.clear();
    this.beatFlash.clear().setAlpha(0);
    this.hitBurst.clear().setAlpha(0).setScale(1);
    this.glassShader.setUniform("uBeat", 0);
  }

  private loadProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) return [0, 0, 0];
      const value: unknown = JSON.parse(raw);
      if (Array.isArray(value)) {
        return STAGE_ORDER.map((_, index) => clamp(Math.floor(Number(value[index]) || 0), 0, 5));
      }
      return [0, 0, 0];
    } catch {
      return [0, 0, 0];
    }
  }

  private saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.completedLevels));
    } catch {
      // Progress still works for the current session when storage is unavailable.
    }
  }

  private syncStageCards() {
    const currentStage = STAGE_ORDER.findIndex(
      (_, index) => this.completedLevels[index] < 5 && (index === 0 || this.completedLevels[index - 1] >= 5),
    );
    document.querySelectorAll<HTMLElement>(".stage-card").forEach((card) => {
      const number = Number(card.dataset.stage);
      const index = number - 1;
      if (!Number.isInteger(index) || index < 0 || index >= STAGE_ORDER.length) return;

      const progress = this.completedLevels[index];
      const completed = progress >= 5;
      const unlocked = index === 0 || this.completedLevels[index - 1] >= 5;
      const title = card.querySelector("h2")?.textContent?.trim() ?? `${number}단계`;
      const status = card.querySelector<HTMLElement>(".stage-card__status");
      const button = card.querySelector<HTMLButtonElement>('[data-action="play-stage"]');

      card.dataset.status = completed ? "completed" : unlocked ? "unlocked" : "locked";
      card.dataset.current = String(index === (currentStage < 0 ? STAGE_ORDER.length - 1 : currentStage));
      if (status) status.textContent = completed ? "클리어" : progress > 0 ? `${progress} / 5` : unlocked ? "플레이 가능" : "잠김";
      if (button) {
        button.disabled = !unlocked;
        button.textContent = completed ? "다시 플레이" : progress > 0 ? "이어하기" : unlocked ? "시작하기" : "잠겨 있어요";
        button.setAttribute("aria-label", `${number}단계 ${title}${unlocked ? " 시작" : ", 잠김"}`);
      }
    });
  }

  private handleMenuClick = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-action="play-stage"]');
    if (!button || !this.menu?.contains(button)) return;
    const theme = STAGE_ORDER[Number(button.dataset.stage) - 1];
    if (theme) void this.startStage(theme);
  };

  private async startStage(theme: ThemeKey) {
    const index = STAGE_ORDER.indexOf(theme);
    if (index < 0 || (index > 0 && this.completedLevels[index - 1] < 5)) return;
    this.cancelRhythm();
    const token = this.rhythmToken;
    this.theme = theme;
    this.playing = true;
    this.stageFinished = false;
    this.levelIndex = this.completedLevels[index] >= 5 ? 0 : this.completedLevels[index];
    this.phraseIndex = 0;
    this.levelPoints = 0;
    this.levelMax = 0;
    this.setPlaySurfaceInert(false);
    this.clearPanel?.setAttribute("hidden", "");
    document.documentElement.dataset.screen = "play";
    this.menu?.setAttribute("aria-hidden", "true");
    this.gameElement?.setAttribute("aria-hidden", "false");
    this.gameElement?.focus();
    this.scene.resume();
    this.quietAudio();
    this.applyTheme(false);
    this.resetSurface();
    await this.ensureAudio();
    if (token !== this.rhythmToken || !this.playing || this.theme !== theme) return;
    if (PORTRAIT_GAME.matches) {
      this.quietAudio();
      this.setPlaySurfaceInert(true);
      this.scene.pause();
      return;
    }
    this.beginLevel();
  }

  private showMenu = () => {
    this.cancelRhythm();
    this.stopRub();
    this.quietAudio();
    this.playing = false;
    this.setPlaySurfaceInert(false);
    this.clearPanel?.setAttribute("hidden", "");
    this.syncStageCards();
    document.documentElement.dataset.screen = "menu";
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", cssToken("--color-lobby-canvas"));
    this.menu?.setAttribute("aria-hidden", "false");
    this.gameElement?.setAttribute("aria-hidden", "true");
    this.scene.pause();
    document.querySelector<HTMLButtonElement>(`.stage-card[data-theme="${this.theme}"] [data-action="play-stage"]`)?.focus();
  };

  private setPlaySurfaceInert(value: boolean) {
    [this.gameElement, this.backButton, this.resetButton].forEach((element) => element?.toggleAttribute("inert", value));
  }

  private handleOrientation = () => {
    if (!this.playing || this.stageFinished) return;
    if (PORTRAIT_GAME.matches) {
      this.setPlaySurfaceInert(true);
      this.cancelRhythm();
      this.stopRub();
      this.quietAudio();
      this.scene.pause();
      return;
    }
    this.setPlaySurfaceInert(false);
    this.scene.resume();
    this.restartLevel();
  };

  private handleGameKeydown = (event: KeyboardEvent) => {
    if (event.repeat || (event.key !== " " && event.key !== "Enter") || !this.acceptingRhythmInput()) return;
    event.preventDefault();
    this.judgeRhythmHit(event, {
      x: GLASS.x + GLASS.width * 0.75,
      y: GLASS.y + GLASS.height * 0.5,
    });
  };

  private handleClearNext = () => {
    const next = STAGE_ORDER[STAGE_ORDER.indexOf(this.theme) + 1];
    if (next) void this.startStage(next);
    else this.showMenu();
  };

  private updateStageChip() {
    if (this.stageChip) this.stageChip.textContent = THEMES[this.theme].button;
    if (this.levelProgress) this.levelProgress.textContent = "레벨 " + (this.levelIndex + 1) + " / 5";
  }

  private setRhythmPhase(phase: RhythmPhase, prompt: string) {
    this.rhythmPhase = phase;
    const labels: Record<RhythmPhase, string> = {
      idle: "대기",
      ready: "준비",
      listen: "먼저 듣기",
      respond: "따라 하기",
      result: "판정",
      complete: "완료",
    };
    if (this.phaseChip) {
      this.phaseChip.textContent = labels[phase];
      this.phaseChip.dataset.phase = phase;
    }
    if (this.rhythmPrompt) this.rhythmPrompt.textContent = prompt;
    this.phaseOverlay.clear();
    const halfWidth = GLASS.width / 2;
    const leftPane = { x: GLASS.x + 6, width: halfWidth - 12 };
    const rightPane = { x: GAME.width / 2 + 6, width: halfWidth - 12 };
    if (phase === "listen") {
      this.phaseOverlay.fillStyle(0x172225, 0.2);
      this.phaseOverlay.fillRoundedRect(rightPane.x, GLASS.y + 6, rightPane.width, GLASS.height - 12, 10);
      this.phaseOverlay.lineStyle(3, 0xffefd0, 0.74);
      this.phaseOverlay.strokeRoundedRect(leftPane.x, GLASS.y + 6, leftPane.width, GLASS.height - 12, 10);
    } else if (phase === "respond") {
      this.phaseOverlay.fillStyle(0x172225, 0.22);
      this.phaseOverlay.fillRoundedRect(leftPane.x, GLASS.y + 6, leftPane.width, GLASS.height - 12, 10);
      this.phaseOverlay.lineStyle(3, 0xffefd0, 0.78);
      this.phaseOverlay.strokeRoundedRect(rightPane.x, GLASS.y + 6, rightPane.width, GLASS.height - 12, 10);
    } else if (phase !== "idle") {
      this.phaseOverlay.fillStyle(0x172225, 0.08);
      this.phaseOverlay.fillRoundedRect(GLASS.x + 6, GLASS.y + 6, GLASS.width - 12, GLASS.height - 12, 10);
    }
    this.rhythmTimeline?.style.setProperty("--rhythm-progress", "0%");
  }

  private beginLevel() {
    if (!this.playing || !this.audio) return;
    this.phraseIndex = 0;
    this.levelPoints = 0;
    this.levelMax = 0;
    this.updateStageChip();
    this.showJudge("레벨 " + (this.levelIndex + 1), "level");
    this.beginPhrase();
  }

  private beginPhrase() {
    if (!this.playing || !this.audio) return;
    const rhythm = RHYTHMS[this.theme];
    const phrase = rhythm.levels[this.levelIndex]?.[this.phraseIndex];
    if (!phrase) return;

    this.resetSurface();
    const token = ++this.rhythmToken;
    const context = this.audio.context;
    const beatSeconds = 60 / rhythm.bpm;
    const cueStart = context.currentTime + 0.35 + beatSeconds * 2;
    const duration = phrase.beats * beatSeconds;
    this.responseStart = cueStart + duration;
    this.responseEnd = this.responseStart + duration;
    this.expectedTimes = phrase.hits.map((tick) => this.responseStart + (tick / RHYTHM_TICKS) * beatSeconds);
    this.matchedTimes = phrase.hits.map(() => false);
    this.phrasePoints = 0;
    this.phraseMax = phrase.hits.length * 100;
    this.phraseExtras = 0;
    this.strokeDirection = undefined;
    this.strokeAnchor = undefined;
    this.gestureHitMade = false;
    this.lastRhythmHitAt = 0;
    this.phaseStart = context.currentTime;
    this.phaseEnd = cueStart;
    this.setRhythmPhase("ready", "문제 " + (this.phraseIndex + 1) + " / 3 · 곧 시작해요");

    for (let beat = -2; beat <= phrase.beats * 2; beat += 1) {
      const at = cueStart + beat * beatSeconds;
      const accent = beat === 0 || beat === phrase.beats;
      this.schedulePulse(at, accent);
      this.scheduleAt(at, token, () => {
        this.beatEnergy = Math.max(this.beatEnergy, accent ? 0.56 : 0.32);
      });
    }
    phrase.hits.forEach((tick, index) => {
      const at = cueStart + (tick / RHYTHM_TICKS) * beatSeconds;
      this.scheduleCueHit(at);
      this.scheduleAt(at, token, () => {
        this.showGuideStroke(index);
        this.pulseCue();
      });
    });
    this.scheduleAt(cueStart, token, () => {
      this.phaseStart = cueStart;
      this.phaseEnd = this.responseStart;
      this.setRhythmPhase("listen", "왼쪽 유리의 리듬을 기억하세요");
    });
    this.scheduleAt(this.responseStart, token, () => {
      this.guideFinger.setVisible(false);
      this.phaseStart = this.responseStart;
      this.phaseEnd = this.responseEnd;
      this.setRhythmPhase("respond", "오른쪽 유리 어디든, 위치는 상관없이 박자만 맞추세요");
    });
    this.scheduleAt(this.responseEnd + rhythm.good, token, () => this.finishPhrase(token));
  }

  private scheduleAt(at: number, token: number, callback: () => void) {
    if (!this.audio) return;
    const delay = Math.max(0, (at - this.audio.context.currentTime) * 1000);
    this.time.delayedCall(delay, () => {
      if (token === this.rhythmToken && this.playing) callback();
    });
  }

  private finishPhrase(token: number) {
    if (token !== this.rhythmToken || !this.playing) return;
    const earned = Math.max(0, this.phrasePoints - this.phraseExtras * 35);
    const accuracy = this.phraseMax ? earned / this.phraseMax : 0;
    this.levelPoints += earned;
    this.levelMax += this.phraseMax;
    this.setRhythmPhase("result", "문제 " + (this.phraseIndex + 1) + " 정확도 " + Math.round(accuracy * 100) + "%");
    this.showJudge(accuracy >= 0.8 ? "좋아요!" : accuracy >= 0.55 ? "괜찮아요" : "다시 집중!", accuracy >= 0.8 ? "perfect" : "good");
    this.phraseIndex += 1;

    if (this.phraseIndex < 3) {
      this.time.delayedCall(850, () => {
        if (token === this.rhythmToken && this.playing) this.beginPhrase();
      });
      return;
    }
    this.finishLevel();
  }

  private finishLevel() {
    const rhythm = RHYTHMS[this.theme];
    const accuracy = this.levelMax ? this.levelPoints / this.levelMax : 0;
    const passed = accuracy >= rhythm.pass[this.levelIndex];
    this.setRhythmPhase(
      "result",
      passed
        ? "레벨 " + (this.levelIndex + 1) + " 클리어 · 정확도 " + Math.round(accuracy * 100) + "%"
        : "정확도 " + Math.round(accuracy * 100) + "% · 같은 레벨에 다시 도전해요",
    );

    if (!passed) {
      this.showJudge("다시 도전", "miss");
      const token = this.rhythmToken;
      this.time.delayedCall(1300, () => {
        if (token === this.rhythmToken && this.playing) this.beginLevel();
      });
      return;
    }

    const stageIndex = STAGE_ORDER.indexOf(this.theme);
    const newlyCompleted = this.completedLevels[stageIndex] < 5;
    this.completedLevels[stageIndex] = Math.max(this.completedLevels[stageIndex], this.levelIndex + 1);
    this.saveProgress();
    this.syncStageCards();
    if (this.levelIndex >= 4) {
      this.completeStage(newlyCompleted);
      return;
    }

    this.showJudge("레벨 " + (this.levelIndex + 1) + " 완료", "perfect");
    this.levelIndex += 1;
    this.phraseIndex = 0;
    this.levelPoints = 0;
    this.levelMax = 0;
    this.updateStageChip();
    const token = this.rhythmToken;
    this.time.delayedCall(1200, () => {
      if (token === this.rhythmToken && this.playing) this.beginLevel();
    });
  }

  private restartLevel = () => {
    if (!this.playing || this.stageFinished || PORTRAIT_GAME.matches) return;
    this.cancelRhythm();
    const token = this.rhythmToken;
    this.phraseIndex = 0;
    this.levelPoints = 0;
    this.levelMax = 0;
    this.resetSurface();
    void this.ensureAudio().then(() => {
      if (token === this.rhythmToken && this.playing) this.beginLevel();
    });
  };

  private cancelRhythm() {
    this.rhythmToken += 1;
    const sources = this.scheduledSources.splice(0);
    sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // The one-shot already ended.
      }
    });
    this.expectedTimes = [];
    this.matchedTimes = [];
    this.responseStart = 0;
    this.responseEnd = 0;
    this.phaseStart = 0;
    this.phaseEnd = 0;
    this.tweens.killTweensOf(this.guideFinger);
    this.guideFinger?.setVisible(false);
    this.resetVisualFeedback();
    if (this.judgePop) this.judgePop.textContent = "";
    if (this.phaseOverlay) this.setRhythmPhase("idle", "");
  }

  private trackSource(source: AudioScheduledSourceNode) {
    this.scheduledSources.push(source);
    source.addEventListener(
      "ended",
      () => {
        const index = this.scheduledSources.indexOf(source);
        if (index >= 0) this.scheduledSources.splice(index, 1);
      },
      { once: true },
    );
  }

  private showJudge(text: string, kind: "perfect" | "good" | "miss" | "level") {
    if (!this.judgePop) return;
    this.judgePop.textContent = text;
    this.judgePop.dataset.judge = kind;
    this.time.delayedCall(520, () => {
      if (this.judgePop?.textContent === text) this.judgePop.textContent = "";
    });
  }

  private completeStage(newlyCleared: boolean) {
    if (this.stageFinished) return;
    this.stageFinished = true;
    this.stopRub();
    this.quietAudio();
    this.cancelRhythm();
    this.playing = false;
    this.setRhythmPhase("complete", "5개 레벨을 모두 완료했어요");
    const index = STAGE_ORDER.indexOf(this.theme);
    this.saveProgress();
    this.syncStageCards();

    const next = STAGE_ORDER[index + 1];
    if (this.clearCopy) {
      this.clearCopy.textContent = next
        ? newlyCleared
          ? `${THEMES[next].button}이 열렸어요.`
          : `${THEMES[this.theme].button}를 다시 클리어했어요.`
        : "모든 스테이지를 완료했어요.";
    }
    if (this.clearNext) this.clearNext.textContent = next ? "다음 스테이지" : "스테이지 선택";
    this.clearMenu?.toggleAttribute("hidden", !next);
    this.setPlaySurfaceInert(true);
    this.clearPanel?.removeAttribute("hidden");
    this.scene.pause();
    this.clearNext?.focus();
  }

  private acceptingRhythmInput() {
    if (!this.playing || this.stageFinished || !this.audio) return false;
    const now = this.audio.context.currentTime;
    const good = RHYTHMS[this.theme].good;
    return now >= this.responseStart - good && now <= this.responseEnd + good;
  }

  private insideResponsePane(point: Point) {
    return (
      point.x >= GAME.width / 2 + 8 &&
      Phaser.Geom.Polygon.Contains(this.surfacePolygon, point.x, point.y)
    );
  }

  private startRub(pointer: Phaser.Input.Pointer) {
    if (!this.acceptingRhythmInput()) return;
    const point = { x: pointer.x, y: pointer.y };
    if (!this.insideResponsePane(point)) return;
    this.rubbing = true;
    this.lastPoint = point;
    this.lastMoveAt = performance.now();
    this.dropDistance = 0;
    this.nextDropDistance = nextDropGap(this.theme);
    this.squeakTravel = 0;
    this.lastSqueakAt = 0;
    this.lastFoleyAt = 0;
    this.audioAmount = 0;
    this.strokeDirection = undefined;
    this.strokeAnchor = point;
    this.gestureHitMade = false;
    this.contact.setPosition(point.x, point.y + 3).setVisible(true);
    this.finger.setPosition(point.x, point.y + 2).setRotation(0.04).setAlpha(0.97).setVisible(true);
    this.frost.erase("frost-brush", point.x - GLASS.x, point.y - GLASS.y).render();
  }

  private moveRub(pointer: Phaser.Input.Pointer) {
    if (!this.rubbing || !pointer.isDown) return;
    const point = { x: pointer.x, y: pointer.y };
    if (!this.insideResponsePane(point)) {
      this.stopRub();
      return;
    }

    const now = performance.now();
    const dx = point.x - this.lastPoint.x;
    const dy = point.y - this.lastPoint.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.8) return;

    const samples = segmentPoints(this.lastPoint, point);
    const angle = Math.atan2(dy, dx);
    const normalX = -dy / distance;
    const normalY = dx / distance;
    for (const sample of samples) {
      this.frost.erase("frost-brush", sample.x - GLASS.x, sample.y - GLASS.y);
    }
    const midX = (this.lastPoint.x + point.x) / 2 - GLASS.x;
    const midY = (this.lastPoint.y + point.y) / 2 - GLASS.y;
    const ridgeLength = Math.max(0.34, (distance + 15) / 92);
    const jitter = (Math.random() - 0.5) * 3;
    const theme = THEMES[this.theme];
    const ridge = {
      rotation: angle,
      scaleX: ridgeLength,
      scaleY: theme.ridgeScaleY + Math.random() * 0.12,
      alpha: theme.ridgeAlpha + Math.random() * 0.1,
    };
    const ridgeOffset = BRUSH_RADIUS - 6;
    this.frost.stamp(theme.ridge, undefined, midX + normalX * (ridgeOffset + jitter), midY + normalY * (ridgeOffset + jitter), ridge);
    this.frost.stamp(theme.ridge, undefined, midX - normalX * (ridgeOffset - jitter), midY - normalY * (ridgeOffset - jitter), {
      ...ridge,
      rotation: angle + Math.PI,
      alpha: ridge.alpha * 0.82,
    });
    this.frost.render();

    const elapsed = Math.max(8, now - this.lastMoveAt);
    const speed = distance / elapsed;
    this.strokes.push({ ...this.lastPoint, x2: point.x, y2: point.y, born: now, angle, energy: clamp(speed / 1.7, 0.18, 1) });
    if (this.strokes.length > 360) this.strokes.shift();
    this.dropDistance += distance;
    if (this.dropDistance > this.nextDropDistance) {
      this.dropDistance -= this.nextDropDistance;
      this.nextDropDistance = nextDropGap(this.theme);
      const limit = this.theme === "frost" ? 3 : MAX_DROPS;
      if (this.drops.length < limit) this.spawnDrop(point, normalX, normalY);
    }

    const nativeEvent = pointer.event as PointerEvent & TouchEvent;
    const pressure = clamp(nativeEvent.pressure || nativeEvent.changedTouches?.[0]?.force || 0.55, 0.25, 1);
    this.updateAudio(speed, distance, pressure);
    const direction = { x: dx / distance, y: dy / distance };
    const anchor = this.strokeAnchor ?? this.lastPoint;
    const displacement = Math.hypot(point.x - anchor.x, point.y - anchor.y);
    const turned = isGestureTurn(this.strokeDirection, direction, displacement);
    if (turned) {
      this.judgeRhythmHit(pointer.event);
      this.gestureHitMade = true;
      this.strokeAnchor = point;
      this.strokeDirection = direction;
    } else {
      if (!this.gestureHitMade && displacement >= 8) {
        this.judgeRhythmHit(pointer.event);
        this.gestureHitMade = true;
        this.strokeAnchor = point;
        this.strokeDirection = direction;
      }
      this.strokeDirection ??= direction;
    }
    const rotation = clamp(dx / 88, -0.17, 0.17);
    this.contact.setPosition(point.x, point.y + 3).setRotation(angle);
    this.finger.setPosition(point.x, point.y + 2).setRotation(Phaser.Math.Linear(this.finger.rotation, rotation, 0.32));
    this.lastPoint = point;
    this.lastMoveAt = now;
  }

  private judgeRhythmHit(event: Event, feedbackPoint?: Point) {
    if (!this.audio || !this.acceptingRhythmInput()) return;
    const context = this.audio.context;
    const stamp = context.getOutputTimestamp();
    const contextTime = stamp.contextTime ?? 0;
    const performanceTime = stamp.performanceTime ?? 0;
    let at = contextTime + (event.timeStamp - performanceTime) / 1000;
    if (!Number.isFinite(at) || contextTime <= 0) {
      const age = clamp((performance.now() - event.timeStamp) / 1000, 0, 0.1);
      at = context.currentTime - (context.outputLatency || context.baseLatency || 0) - age;
    }
    if (at - this.lastRhythmHitAt < 0.075) return;
    this.lastRhythmHitAt = at;

    let nearest = -1;
    let nearestDelta = Number.POSITIVE_INFINITY;
    this.expectedTimes.forEach((target, index) => {
      if (this.matchedTimes[index]) return;
      const delta = Math.abs(at - target);
      if (delta < nearestDelta) {
        nearest = index;
        nearestDelta = delta;
      }
    });

    const rhythm = RHYTHMS[this.theme];
    const score = scoreRhythmHit(nearestDelta, rhythm);
    if (nearest < 0 || score === 0) {
      this.phraseExtras += 1;
      this.pulseHit("miss", feedbackPoint);
      this.showJudge("\uC5C7\uBC15!", "miss");
      return;
    }
    this.matchedTimes[nearest] = true;
    this.phrasePoints += score;
    if (score === 100) {
      this.pulseHit("perfect", feedbackPoint);
      this.showJudge("\uBF40\uB4DD!", "perfect");
    } else {
      this.pulseHit("good", feedbackPoint);
      this.showJudge("\uC4F1!", "good");
    }
  }

  private spawnDrop(point: Point, normalX: number, normalY: number) {
    const size = Math.random();
    const radius = size < 0.12 ? 11 + Math.random() * 4 : size < 0.38 ? 7 + Math.random() * 3 : 4 + Math.random() * 2.5;
    const flowing = radius > 10 && Math.random() < 0.55;
    const variant = Math.floor(Math.random() * DROP_VARIANTS);
    const side = Math.random() < 0.5 ? -1 : 1;
    const offset = BRUSH_RADIUS - radius * 0.35;
    const tangentJitter = (Math.random() - 0.5) * 12;
    const marginX = radius * 1.65 + 2;
    const marginY = radius * 1.65 + 2;
    const x = clamp(
      point.x + normalX * side * offset + normalY * tangentJitter,
      GLASS.x + marginX,
      GLASS.x + GLASS.width - marginX,
    );
    const y = clamp(
      point.y + normalY * side * offset - normalX * tangentJitter + 2,
      GLASS.y + marginY,
      GLASS.y + GLASS.height - marginY,
    );
    const sprite = this.add
      .image(x, y, `drop-gloss-${variant}`)
      .setDisplaySize(radius * 3.2, radius * 3.2)
      .setAlpha(radius > 10 ? 0.96 : radius > 6 ? 0.9 : 0.82)
      .setDepth(8);
    this.dropLayer.add(sprite);
    if (this.theme === "shower") sprite.setTint(0xd9fffb);
    this.drops.push({
      x,
      y,
      radius,
      speed: 0,
      hold: flowing ? 900 + Math.random() * 1900 : Number.POSITIVE_INFINITY,
      phase: Math.random() * Math.PI * 2,
      heightKey: `drop-height-${variant}`,
      history: [{ x, y }],
      sprite,
    });
  }

  private stopRub() {
    if (!this.rubbing) return;
    this.rubbing = false;
    this.finger.setVisible(false);
    this.contact.setVisible(false);
    this.quietAudio();
  }

  private resetSurface() {
    this.stopRub();
    this.resetVisualFeedback();
    this.frost.clear().draw(THEMES[this.theme].source, GLASS.width / 2, GLASS.height / 2).render();
    this.waterMap.clear().render();
    this.strokes = [];
    this.drops.forEach((drop) => drop.sprite.destroy());
    this.drops = [];
    this.dropDistance = 0;
    this.nextDropDistance = nextDropGap(this.theme);
    this.squeakTravel = 0;
    this.wetLayer.clear();
    this.wetSurfaceActive = false;
    this.tweens.killTweensOf(this.guideFinger);
    this.guideFinger.setVisible(false);
    this.finger.setVisible(false);
    this.contact.setVisible(false);
  }

  private ensureAudio() {
    if (this.audio) return this.audio.context.resume();
    return (this.audioReady ??= this.createAudio().finally(() => {
      this.audioReady = undefined;
    }));
  }

  private async createAudio() {
    const context = new AudioContext();
    const foley: Record<ThemeKey, AudioBuffer[]> = { frost: [], mist: [], shower: [] };
    let rubberHit: AudioBuffer | undefined;
    try {
      const decode = (key: string) => {
        const bytes = this.cache.binary.get(key) as ArrayBuffer | undefined;
        if (!bytes) throw new Error(`폴리 오디오를 찾을 수 없습니다: ${key}`);
        return context.decodeAudioData(bytes.slice(0));
      };
      const [frostScrape, frostSqueak, mist, hit, showerWet, showerWipe] = await Promise.all([
        decode("foley-frost-scrape"),
        decode("foley-frost-squeak"),
        decode("foley-mist"),
        decode("foley-rubber-hit"),
        decode("foley-shower-wet"),
        decode("foley-shower-wipe"),
      ]);
      foley.frost.push(frostScrape, frostSqueak);
      foley.mist.push(mist);
      foley.shower.push(showerWet, showerWipe);
      rubberHit = hit;
      if (import.meta.env.DEV) {
        console.assert(
          Object.values(foley).every((buffers) => buffers.length > 0 && buffers.every((buffer) => buffer.duration > 0.2)) &&
            rubberHit.duration > 0.2,
          "실제 폴리 오디오 디코딩이 누락됐습니다.",
        );
      }
    } catch (error) {
      console.warn("실제 폴리 오디오를 불러오지 못해 합성음으로 재생합니다.", error);
    }
    if (!this.sys.isActive()) {
      await context.close();
      return;
    }

    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    let softNoise = 0;
    for (let index = 0; index < data.length; index += 1) {
      const white = Math.random() * 2 - 1;
      softNoise = softNoise * 0.9 + white * 0.1;
      data[index] = white * 0.22 + softNoise * 0.78;
    }
    for (let index = 0; index < 256; index += 1) {
      const mix = (index + 1) / 256;
      const tail = data.length - 256 + index;
      data[tail] = Phaser.Math.Linear(data[tail], data[0], mix);
    }

    const source = context.createBufferSource();
    const squeakTone = context.createOscillator();
    const bodyFilter = context.createBiquadFilter();
    const squeakFilter = context.createBiquadFilter();
    const bodyGain = context.createGain();
    const squeakGain = context.createGain();
    const toneGain = context.createGain();
    const master = context.createGain();
    const limiter = context.createDynamicsCompressor();

    source.buffer = buffer;
    source.loop = true;
    squeakTone.type = "triangle";
    squeakTone.frequency.value = 320;
    bodyFilter.type = "bandpass";
    bodyFilter.frequency.value = 560;
    bodyFilter.Q.value = 0.75;
    squeakFilter.type = "bandpass";
    squeakFilter.frequency.value = 900;
    squeakFilter.Q.value = 2.4;
    bodyGain.gain.value = 0;
    squeakGain.gain.value = 0;
    toneGain.gain.value = 0;
    master.gain.value = 5;
    limiter.threshold.value = -6;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.08;

    source.connect(bodyFilter).connect(bodyGain).connect(master);
    source.connect(squeakFilter).connect(squeakGain).connect(master);
    squeakTone.connect(toneGain).connect(squeakFilter);
    master.connect(limiter).connect(context.destination);
    source.start();
    squeakTone.start();
    this.audio = { context, source, squeakTone, bodyFilter, squeakFilter, bodyGain, squeakGain, toneGain, master, foley, rubberHit };
    await context.resume();
  }

  private schedulePulse(at: number, accent: boolean) {
    if (!this.audio) return;
    const oscillator = this.audio.context.createOscillator();
    const gain = this.audio.context.createGain();
    const frequencies =
      this.theme === "frost" ? [820, 560] : this.theme === "mist" ? [430, 290] : [680, 455];
    oscillator.type = this.theme === "mist" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(accent ? frequencies[0] : frequencies[1], at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(accent ? 0.038 : 0.018, at + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.045);
    oscillator.connect(gain).connect(this.audio.master);
    oscillator.start(at);
    oscillator.stop(at + 0.05);
    this.trackSource(oscillator);
  }

  private scheduleCueHit(at: number) {
    if (!this.audio?.source.buffer) return;
    const context = this.audio.context;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const pan = context.createStereoPanner();
    source.buffer = this.audio.source.buffer;
    filter.type = "bandpass";
    pan.pan.setValueAtTime(-0.42, at);
    gain.gain.setValueAtTime(0.0001, at);

    if (this.theme === "frost") {
      filter.frequency.setValueAtTime(2500, at);
      filter.Q.setValueAtTime(2.2, at);
      gain.gain.linearRampToValueAtTime(0.13, at + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.065);
    } else {
      const tone = context.createOscillator();
      tone.type = "triangle";
      tone.frequency.setValueAtTime(this.theme === "shower" ? 520 : 340, at);
      tone.frequency.exponentialRampToValueAtTime(this.theme === "shower" ? 390 : 245, at + 0.075);
      tone.connect(filter);
      tone.start(at);
      tone.stop(at + 0.08);
      this.trackSource(tone);
      filter.frequency.setValueAtTime(this.theme === "shower" ? 1900 : 1450, at);
      filter.frequency.exponentialRampToValueAtTime(this.theme === "shower" ? 1050 : 820, at + 0.075);
      filter.Q.setValueAtTime(this.theme === "shower" ? 8 : 6, at);
      gain.gain.linearRampToValueAtTime(0.14, at + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.078);
    }

    source.connect(filter).connect(gain).connect(pan).connect(this.audio.master);
    source.start(at, Math.random() * Math.max(0.01, source.buffer.duration - 0.1), 0.085);
    this.trackSource(source);
    this.playFoley(at, -0.42, 0.72, true);
  }

  private playFoley(at: number, panValue: number, amount: number, cue = false) {
    if (!this.audio) return;
    const buffers = this.audio.foley[this.theme];
    if (!buffers.length) return;
    const context = this.audio.context;
    const buffer = buffers[Math.floor(Math.random() * buffers.length)];
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const pan = context.createStereoPanner();
    const duration = Math.min(buffer.duration, cue ? 0.095 : this.theme === "frost" ? 0.06 : 0.085);
    const outputDuration = duration / (0.9 + amount * 0.2);
    const offset = Math.random() * Math.max(0, buffer.duration - duration - 0.01);
    const peak = (cue ? 0.03 : 0.019) * (0.72 + amount * 0.42);
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(0.9 + amount * 0.2, at);
    filter.type = "highpass";
    filter.frequency.setValueAtTime(this.theme === "frost" ? 520 : this.theme === "mist" ? 180 : 120, at);
    filter.Q.setValueAtTime(0.55, at);
    pan.pan.setValueAtTime(panValue, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(peak, at + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + outputDuration);
    source.connect(filter).connect(gain).connect(pan).connect(this.audio.master);
    source.start(at, offset, duration);
    source.stop(at + outputDuration + 0.015);
    this.trackSource(source);
  }

  private playJudgeFoley(kind: "perfect" | "good" | "miss") {
    if (!this.audio?.rubberHit || kind === "miss") return;
    const at = this.audio.context.currentTime;
    const source = this.audio.context.createBufferSource();
    const gain = this.audio.context.createGain();
    const pan = this.audio.context.createStereoPanner();
    source.buffer = this.audio.rubberHit;
    source.playbackRate.setValueAtTime(this.theme === "frost" ? 1.18 : this.theme === "shower" ? 0.92 : 1, at);
    gain.gain.setValueAtTime(kind === "perfect" ? 0.014 : 0.009, at);
    pan.pan.setValueAtTime(0.36, at);
    source.connect(gain).connect(pan).connect(this.audio.master);
    source.start(at, 0, Math.min(0.18, source.buffer.duration));
    this.trackSource(source);
  }

  private showGuideStroke(index: number) {
    const y = 243 + (index % 4) * 92;
    const left = 330;
    const right = GAME.width / 2 - 135;
    const forward = index % 2 === 0;
    const from = { x: forward ? left : right, y };
    const to = { x: forward ? right : left, y: y + (index % 3 - 1) * 8 };
    segmentPoints(from, to).forEach((point) => {
      this.frost.erase("guide-brush", point.x - GLASS.x, point.y - GLASS.y);
    });
    this.frost.render();
    this.tweens.killTweensOf(this.guideFinger);
    this.guideFinger
      .setPosition(from.x, from.y + 2)
      .setRotation(forward ? 0.08 : -0.08)
      .setAlpha(0.46)
      .setVisible(true);
    this.tweens.add({
      targets: this.guideFinger,
      x: to.x,
      y: to.y + 2,
      rotation: forward ? -0.06 : 0.06,
      duration: 115,
      ease: "Sine.Out",
      onComplete: () => this.guideFinger.setVisible(false),
    });
  }

  private updateAudio(speed: number, distance: number, pressure: number) {
    if (!this.audio) return;
    this.audioAmount = Phaser.Math.Linear(this.audioAmount, clamp(speed / 2.2), 0.28);
    const amount = this.audioAmount;
    const now = this.audio.context.currentTime;
    const force = clamp(pressure, 0.25, 1);
    this.squeakTravel += distance;
    if (this.theme === "frost") {
      this.audio.bodyFilter.type = "bandpass";
      this.audio.bodyGain.gain.setTargetAtTime((0.01 + amount * 0.036) * (0.65 + force * 0.55), now, 0.018);
      this.audio.toneGain.gain.setTargetAtTime(0, now, 0.012);
      this.audio.bodyFilter.frequency.setTargetAtTime(650 + amount * 1150, now, 0.028);
      this.audio.bodyFilter.Q.setTargetAtTime(0.55 + force * 0.25, now, 0.03);
      const gap = frictionGap("frost", amount, force);
      const interval = 0.03 - amount * 0.01;
      if (this.squeakTravel >= gap && now - this.lastSqueakAt >= interval) {
        this.squeakTravel %= gap;
        this.lastSqueakAt = now;
        this.triggerFrostGrain(amount, force, now);
      }
      return;
    }

    const shower = this.theme === "shower";
    this.audio.bodyFilter.type = "bandpass";
    this.audio.bodyGain.gain.setTargetAtTime(
      (shower ? 0.006 + amount * 0.021 : 0.004 + amount * 0.018) * (0.65 + force * 0.45),
      now,
      0.018,
    );
    this.audio.bodyFilter.frequency.setTargetAtTime(shower ? 420 + amount * 420 : 520 + amount * 520, now, 0.026);
    this.audio.bodyFilter.Q.setTargetAtTime(0.65, now, 0.03);
    this.audio.toneGain.gain.setTargetAtTime(shower ? 0.1 + force * 0.09 : 0.14 + force * 0.12, now, 0.016);
    this.audio.squeakFilter.Q.setTargetAtTime((shower ? 7 : 5) + force * 5, now, 0.025);
    const gap = frictionGap(this.theme, amount, force);
    const interval = shower ? 0.06 - amount * 0.025 : 0.07 - amount * 0.027;
    if (this.squeakTravel < gap || now - this.lastSqueakAt < interval) return;
    this.squeakTravel %= gap;
    this.lastSqueakAt = now;
    this.triggerWetSqueak(amount, force, now);
  }

  private triggerFrostGrain(amount: number, pressure: number, now: number) {
    if (!this.audio) return;
    const duration = 0.022 - amount * 0.012;
    const peak = (0.018 + amount * 0.03) * (0.7 + pressure * 0.5);
    const gain = this.audio.squeakGain.gain;
    gain.cancelAndHoldAtTime(now);
    gain.linearRampToValueAtTime(peak, now + 0.001);
    gain.exponentialRampToValueAtTime(0.0001, now + duration);
    this.audio.squeakFilter.frequency.cancelAndHoldAtTime(now);
    this.audio.squeakFilter.frequency.setValueAtTime(1800 + amount * 1700 + Math.random() * 900, now);
    this.audio.squeakFilter.Q.setTargetAtTime(1.4 + pressure * 2.2, now, 0.004);
    if (now - this.lastFoleyAt >= 0.045) {
      this.lastFoleyAt = now;
      this.playFoley(now, 0.34, (amount + pressure) * 0.5);
    }
  }

  private triggerWetSqueak(amount: number, pressure: number, now: number) {
    if (!this.audio) return;
    const shower = this.theme === "shower";
    const duration = shower ? 0.048 - amount * 0.016 : 0.054 - amount * 0.018;
    const pitch =
      (shower ? 380 + amount * 210 + pressure * 90 : 250 + amount * 210 + pressure * 95) +
      (Math.random() - 0.5) * 30;
    const peak = 0.025 + amount * 0.032 + pressure * 0.018;
    const gain = this.audio.squeakGain.gain;
    gain.cancelAndHoldAtTime(now);
    gain.linearRampToValueAtTime(peak, now + 0.002);
    gain.exponentialRampToValueAtTime(0.0001, now + duration);

    this.audio.squeakTone.frequency.cancelAndHoldAtTime(now);
    this.audio.squeakTone.frequency.setValueAtTime(pitch * 1.08, now);
    this.audio.squeakTone.frequency.exponentialRampToValueAtTime(pitch * 0.86, now + duration);
    this.audio.squeakFilter.frequency.cancelAndHoldAtTime(now);
    this.audio.squeakFilter.frequency.setValueAtTime(
      shower ? 1950 + amount * 1050 + pressure * 420 : 1600 + amount * 1000 + pressure * 400,
      now,
    );
    this.audio.squeakFilter.frequency.exponentialRampToValueAtTime(
      shower ? 1120 + amount * 620 + pressure * 240 : 900 + amount * 600 + pressure * 220,
      now + duration,
    );
    if (now - this.lastFoleyAt >= 0.052) {
      this.lastFoleyAt = now;
      this.playFoley(now, 0.34, (amount + pressure) * 0.5);
    }
  }

  private quietAudio() {
    if (!this.audio) return;
    const now = this.audio.context.currentTime;
    this.audioAmount = 0;
    this.audio.bodyGain.gain.cancelAndHoldAtTime(now);
    this.audio.bodyGain.gain.setTargetAtTime(0, now, 0.026);
    this.audio.squeakGain.gain.cancelAndHoldAtTime(now);
    this.audio.squeakGain.gain.setTargetAtTime(0, now, 0.012);
    this.audio.squeakFilter.frequency.cancelAndHoldAtTime(now);
    this.audio.squeakTone.frequency.cancelAndHoldAtTime(now);
  }

  private updateDrops(delta: number) {
    const seconds = Math.min(delta / 1000, 0.04);
    for (const drop of this.drops) {
      drop.hold -= delta;
      if (drop.hold <= 0) {
        const terminal = 28 + drop.radius * 2.4;
        drop.speed = Math.min(terminal, drop.speed + (8 + drop.radius * 2.2) * seconds);
        drop.phase += seconds * (0.7 + drop.speed * 0.018);
        const wobble = this.theme === "shower" ? 0.12 : 0.28;
        drop.x += Math.sin(drop.phase) * seconds * (0.4 + drop.speed * 0.015) * wobble;
        drop.y += drop.speed * seconds;
        if (drop.speed > 9 && Math.random() < seconds * 0.35) {
          drop.hold = 140 + Math.random() * 360;
          drop.speed *= 0.52;
        }
        if (drop.history.length === 0 || Math.hypot(drop.x - drop.history[0].x, drop.y - drop.history[0].y) > 3.5) {
          drop.history.unshift({ x: drop.x, y: drop.y });
          drop.history.length = Math.min(drop.history.length, 7);
        }
      }
      const stretch = 1 + clamp(drop.speed / (28 + drop.radius * 2.4)) * 0.38;
      drop.x = clamp(drop.x, GLASS.x + drop.radius * 1.65 + 1, GLASS.x + GLASS.width - drop.radius * 1.65 - 1);
      drop.sprite.setPosition(drop.x, drop.y).setDisplaySize(drop.radius * 3.2, drop.radius * 3.2 * stretch);
    }

    // ponytail: O(n²) 합체는 48방울 제한에서 충분함. 상한을 늘릴 때만 spatial hash로 교체.
    for (let left = 0; left < this.drops.length; left += 1) {
      for (let right = left + 1; right < this.drops.length; right += 1) {
        const a = this.drops[left];
        const b = this.drops[right];
        if (Math.hypot(a.x - b.x, a.y - b.y) > (a.radius + b.radius) * 0.72) continue;
        const areaA = a.radius ** 2;
        const areaB = b.radius ** 2;
        a.x = (a.x * areaA + b.x * areaB) / (areaA + areaB);
        a.y = (a.y * areaA + b.y * areaB) / (areaA + areaB);
        a.radius = Math.min(18, Math.sqrt(areaA + areaB));
        a.speed = Math.max(a.speed, b.speed);
        a.hold =
          a.radius > 10
            ? Math.min(a.hold, b.hold, 180 + Math.random() * 420)
            : Math.min(a.hold, b.hold);
        a.history = [{ x: a.x, y: a.y }];
        b.sprite.destroy();
        this.drops.splice(right, 1);
        right -= 1;
      }
    }

    this.drops = this.drops.filter((drop) => {
      const stretch = 1 + clamp(drop.speed / (28 + drop.radius * 2.4)) * 0.38;
      if (drop.y + drop.radius * 1.6 * stretch < GLASS.y + GLASS.height - 1) return true;
      drop.sprite.destroy();
      return false;
    });
  }

  private renderWetSurface(now: number) {
    if (this.strokes.length === 0 && this.drops.length === 0) {
      if (this.wetSurfaceActive) {
        this.wetLayer.clear();
        this.waterMap.clear().render();
        this.wetSurfaceActive = false;
      }
      return;
    }
    this.wetSurfaceActive = true;
    this.wetLayer.clear();
    this.waterMap.clear();
    this.strokes = this.strokes.filter((stroke) => {
      const life = (now - stroke.born) / 10500;
      if (life >= 1) return false;
      const fade = 1 - life;
      const midX = (stroke.x + stroke.x2) / 2;
      const midY = (stroke.y + stroke.y2) / 2;
      const distance = Math.hypot(stroke.x2 - stroke.x, stroke.y2 - stroke.y);
      this.waterMap.stamp("wet-height", undefined, midX - GLASS.x, midY - GLASS.y, {
        rotation: stroke.angle,
        scaleX: Math.max(0.46, (distance + 82) / 128),
        scaleY: 0.36,
        alpha:
          (this.theme === "frost"
            ? 0.13 + stroke.energy * 0.12
            : this.theme === "shower"
              ? 0.045 + stroke.energy * 0.06
              : 0.055 + stroke.energy * 0.07) *
          fade *
          fade,
      });

      if (Math.floor(stroke.born / 37) % 3 === 0) {
        this.wetLayer.lineStyle(1.1, 0xf8f2eb, 0.12 * fade);
        this.wetLayer.beginPath();
        this.wetLayer.moveTo(
          clamp(stroke.x - 5, GLASS.x + 1, GLASS.x + GLASS.width - 1),
          clamp(stroke.y - 6, GLASS.y + 1, GLASS.y + GLASS.height - 1),
        );
        this.wetLayer.lineTo(
          clamp(stroke.x2 - 5, GLASS.x + 1, GLASS.x + GLASS.width - 1),
          clamp(stroke.y2 - 6, GLASS.y + 1, GLASS.y + GLASS.height - 1),
        );
        this.wetLayer.strokePath();
      }
      return true;
    });

    for (const drop of this.drops) {
      this.waterMap.stamp(drop.heightKey, undefined, drop.x - GLASS.x, drop.y - GLASS.y, {
        scaleX: drop.radius / 60,
        scaleY: (drop.radius / 60) * (1 + clamp(drop.speed / (28 + drop.radius * 2.4)) * 0.38),
        alpha: 0.94,
      });

      if (drop.history.length > 1) {
        const tailInset = Math.max(2, drop.radius * 0.4);
        const tail = drop.history.map(
          (point) =>
            new Phaser.Math.Vector2(
              clamp(point.x, GLASS.x + tailInset, GLASS.x + GLASS.width - tailInset),
              clamp(point.y, GLASS.y + tailInset, GLASS.y + GLASS.height - tailInset),
            ),
        );
        for (let index = 0; index < tail.length - 1; index += 1) {
          const taper = 1 - index / tail.length;
          const from = tail[index];
          const to = tail[index + 1];
          this.wetLayer.lineStyle(Math.max(1, drop.radius * 0.58 * taper), 0x130d09, 0.08 * taper);
          this.wetLayer.lineBetween(from.x + 1, from.y + 1, to.x + 1, to.y + 1);
          this.wetLayer.lineStyle(Math.max(0.6, drop.radius * 0.12 * taper), 0xfff8ef, 0.15 * taper);
          this.wetLayer.lineBetween(from.x - 0.7, from.y - 0.7, to.x - 0.7, to.y - 0.7);
        }
      }
    }
    this.waterMap.render();
  }

  update(time: number, delta: number) {
    const now = performance.now();
    this.beatEnergy *= Math.exp(-delta / 150);
    if (this.beatEnergy < 0.001) this.beatEnergy = 0;
    this.glassShader.setUniform("uTime", time / 1000);
    this.glassShader.setUniform("uBeat", this.beatEnergy);
    this.drawAmbient(time / 1000);
    if (this.rubbing && now - this.lastMoveAt > 72) this.quietAudio();
    if (this.rubbing && !this.acceptingRhythmInput()) this.stopRub();
    if (this.audio && this.phaseEnd > this.phaseStart) {
      const progress = clamp((this.audio.context.currentTime - this.phaseStart) / (this.phaseEnd - this.phaseStart));
      this.rhythmTimeline?.style.setProperty("--rhythm-progress", Math.round(progress * 100) + "%");
    }
    this.updateDrops(delta);
    this.renderWetSurface(now);
  }
}

new Phaser.Game({
  type: Phaser.WEBGL,
  parent: "game",
  width: GAME.width,
  height: GAME.height,
  backgroundColor: cssToken("--stage-camera"),
  scene: FrostScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: { windowEvents: true },
  render: { antialias: true },
});
