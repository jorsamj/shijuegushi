import fs from "node:fs";
import path from "node:path";

const sampleRate = 44100;
const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const outRoot = path.join(root, "assets/audio/generated");

const rendered = [];

const manifest = [
  ["bgm/bgm_rain_night_loop.wav", 42, renderRainNightBgm],
  ["bgm/bgm_horror_corridor.wav", 38, renderHorrorCorridorBgm],
  ["bgm/bgm_ending_archive.wav", 44, renderEndingArchiveBgm],
  ["ambience/amb_rain_heavy_loop.wav", 36, renderRainLoop],
  ["ambience/amb_room_night_loop.wav", 30, renderRoomNight],
  ["ambience/amb_corridor_hum.wav", 34, renderCorridorHum],
  ["sfx/sfx_phone_vibrate.wav", 0.72, renderPhoneVibrate],
  ["sfx/sfx_phone_ring_dead_call.wav", 1.35, renderDeadCallRing],
  ["sfx/sfx_message_pop_cold.wav", 0.34, renderMessagePop],
  ["sfx/sfx_doorbell_rain_night.wav", 1.12, renderDoorbell],
  ["sfx/sfx_knock_soft.wav", 0.9, renderKnockSoft],
  ["sfx/sfx_door_chain_close.wav", 0.62, renderDoorChain],
  ["sfx/sfx_door_lock_turn.wav", 0.72, renderDoorLock],
  ["sfx/sfx_door_open_slow.wav", 1.9, renderDoorOpen],
  ["sfx/sfx_footstep_corridor_wet.wav", 1.35, renderWetFootsteps],
  ["sfx/sfx_corridor_light_flicker.wav", 1.1, renderLightFlicker],
  ["sfx/sfx_old_phone_start.wav", 1.05, renderOldPhoneStart],
  ["sfx/sfx_recording_static_short.wav", 0.55, renderRecordingStatic],
  ["sfx/sfx_photo_zoom.wav", 0.42, renderPhotoZoom],
  ["sfx/sfx_marker_circle.wav", 0.38, renderMarkerCircle],
  ["sfx/sfx_choice_confirm_soft.wav", 0.24, renderChoiceConfirm],
  ["stingers/linzhou_gasp_short.wav", 0.62, renderLinzhouGasp],
  ["stingers/linzhou_breath_tense.wav", 1.55, renderLinzhouBreath],
  ["stingers/xuzhiwan_low_breath.wav", 1.25, renderXuzhiwanBreath],
  ["stingers/xuzhiwan_step_wet.wav", 0.85, renderXuzhiwanStep],
  ["stingers/zhouyu_low_laugh.wav", 0.95, renderZhouyuLaugh],
  ["stingers/zhouyu_pressure_breath.wav", 1.3, renderZhouyuBreath],
  ["stingers/xuzhixia_static_breath.wav", 1.2, renderXuzhixiaBreath],
  ["stingers/xuzhixia_recording_cut.wav", 0.42, renderRecordingCut],
];

for (const [relativePath, duration, renderer] of manifest) {
  const buffer = renderer(createBuffer(duration), duration);
  normalize(buffer, 0.88);
  fade(buffer, 0.01, 0.025);
  const filePath = path.join(outRoot, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, encodeWav(buffer));
  rendered.push({ path: path.relative(root, filePath).replace(/\\/g, "/"), duration: buffer.length / sampleRate });
}

for (const item of rendered) {
  console.log(`${item.path} ${item.duration.toFixed(2)}s`);
}
console.log(`Generated ${rendered.length} procedural WAV assets.`);

function createBuffer(durationSeconds) {
  return new Float32Array(Math.max(1, Math.floor(durationSeconds * sampleRate)));
}

function addTone(buffer, options = {}) {
  const {
    start = 0,
    duration = buffer.length / sampleRate,
    frequency = 220,
    type = "sine",
    gain = 0.1,
    attack = 0.02,
    release = 0.05,
    detune = 0,
    panLfo = 0,
  } = options;
  const startIndex = Math.max(0, Math.floor(start * sampleRate));
  const endIndex = Math.min(buffer.length, startIndex + Math.floor(duration * sampleRate));
  for (let i = startIndex; i < endIndex; i++) {
    const localT = (i - startIndex) / sampleRate;
    const t = i / sampleRate;
    const f = typeof frequency === "function" ? frequency(localT, t) : frequency;
    const phase = 2 * Math.PI * (f + detune * Math.sin(t * 0.21)) * localT;
    const env = envelope(localT, duration, attack, release);
    const lfo = panLfo ? 1 + Math.sin(t * panLfo * Math.PI * 2) * 0.08 : 1;
    buffer[i] += waveform(type, phase) * gain * env * lfo;
  }
}

function addNoise(buffer, options = {}) {
  const {
    start = 0,
    duration = buffer.length / sampleRate,
    gain = 0.04,
    attack = 0.02,
    release = 0.05,
    lowpassHz = 1800,
    highpassHz = 0,
    seed = 7,
    pulse = null,
  } = options;
  const startIndex = Math.max(0, Math.floor(start * sampleRate));
  const endIndex = Math.min(buffer.length, startIndex + Math.floor(duration * sampleRate));
  let state = seed;
  let low = 0;
  let highState = 0;
  const lp = Math.min(0.98, Math.max(0.01, 2 * Math.PI * lowpassHz / sampleRate));
  const hp = highpassHz ? Math.min(0.98, Math.max(0.01, 2 * Math.PI * highpassHz / sampleRate)) : 0;
  for (let i = startIndex; i < endIndex; i++) {
    const localT = (i - startIndex) / sampleRate;
    state = (state * 1664525 + 1013904223) >>> 0;
    let sample = ((state / 0xffffffff) * 2 - 1);
    low += lp * (sample - low);
    sample = low;
    if (hp) {
      highState += hp * (sample - highState);
      sample -= highState;
    }
    const pulseGain = pulse ? pulse(localT) : 1;
    buffer[i] += sample * gain * envelope(localT, duration, attack, release) * pulseGain;
  }
}

function addImpulse(buffer, time, gain = 0.3, frequency = 220, decay = 0.15, noise = 0.02) {
  addTone(buffer, {
    start: time,
    duration: decay,
    frequency: (t) => frequency * Math.pow(0.45, t / decay),
    type: "triangle",
    gain,
    attack: 0.003,
    release: decay * 0.92,
  });
  addNoise(buffer, {
    start: time,
    duration: decay * 0.7,
    gain: noise,
    lowpassHz: 1200,
    highpassHz: 80,
    attack: 0.001,
    release: decay * 0.65,
  });
}

function addBreath(buffer, start, duration, gain, seed = 3, pitch = 190) {
  addNoise(buffer, {
    start,
    duration,
    gain,
    lowpassHz: 900,
    highpassHz: 120,
    attack: duration * 0.2,
    release: duration * 0.35,
    seed,
  });
  addTone(buffer, {
    start,
    duration,
    frequency: (t) => pitch + Math.sin(t * 3) * 12,
    type: "sine",
    gain: gain * 0.16,
    attack: duration * 0.25,
    release: duration * 0.35,
  });
}

function waveform(type, phase) {
  if (type === "triangle") return (2 / Math.PI) * Math.asin(Math.sin(phase));
  if (type === "square") return Math.sign(Math.sin(phase)) || 0;
  return Math.sin(phase);
}

function envelope(t, duration, attack, release) {
  const a = attack <= 0 ? 1 : Math.min(1, t / attack);
  const r = release <= 0 ? 1 : Math.min(1, (duration - t) / release);
  return Math.max(0, Math.min(a, r));
}

function normalize(buffer, target = 0.9) {
  let peak = 0;
  for (const value of buffer) peak = Math.max(peak, Math.abs(value));
  if (!peak) return;
  const scale = Math.min(target / peak, 1.8);
  for (let i = 0; i < buffer.length; i++) buffer[i] *= scale;
}

function fade(buffer, fadeInSeconds = 0.01, fadeOutSeconds = 0.02) {
  const fadeIn = Math.floor(fadeInSeconds * sampleRate);
  const fadeOut = Math.floor(fadeOutSeconds * sampleRate);
  for (let i = 0; i < Math.min(fadeIn, buffer.length); i++) buffer[i] *= i / fadeIn;
  for (let i = 0; i < Math.min(fadeOut, buffer.length); i++) {
    const idx = buffer.length - 1 - i;
    buffer[idx] *= i / fadeOut;
  }
}

function lowShelf(buffer, factor = 0.96) {
  let last = 0;
  for (let i = 0; i < buffer.length; i++) {
    last = last * factor + buffer[i] * (1 - factor);
    buffer[i] = last;
  }
}

function renderRainNightBgm(buffer, duration) {
  addTone(buffer, { duration, frequency: 46, type: "sine", gain: 0.08, attack: 4, release: 5, detune: 1.8 });
  addTone(buffer, { duration, frequency: (t) => 88 + Math.sin(t * 0.08) * 2.5, type: "triangle", gain: 0.035, attack: 5, release: 7 });
  addTone(buffer, { start: 8, duration: duration - 12, frequency: 131, type: "sine", gain: 0.018, attack: 6, release: 8 });
  addNoise(buffer, { duration, gain: 0.01, lowpassHz: 700, highpassHz: 35, attack: 3, release: 4, seed: 21 });
  lowShelf(buffer, 0.88);
  return buffer;
}

function renderHorrorCorridorBgm(buffer, duration) {
  addTone(buffer, { duration, frequency: 39, type: "sine", gain: 0.1, attack: 3, release: 5, detune: 1.4 });
  addTone(buffer, { duration, frequency: (t) => 73 + Math.sin(t * 0.13) * 1.8, type: "triangle", gain: 0.045, attack: 4, release: 6 });
  addTone(buffer, { start: 5, duration: duration - 8, frequency: (t) => 147 + Math.sin(t * 0.37) * 4, type: "sine", gain: 0.016, attack: 8, release: 6 });
  addNoise(buffer, { duration, gain: 0.012, lowpassHz: 520, highpassHz: 45, attack: 3, release: 5, seed: 31 });
  return buffer;
}

function renderEndingArchiveBgm(buffer, duration) {
  addTone(buffer, { duration, frequency: 52, type: "sine", gain: 0.07, attack: 4, release: 7 });
  addTone(buffer, { duration, frequency: (t) => 104 + Math.sin(t * 0.06) * 1.5, type: "triangle", gain: 0.032, attack: 7, release: 8 });
  addTone(buffer, { start: 10, duration: duration - 12, frequency: 156, type: "sine", gain: 0.015, attack: 8, release: 9 });
  addNoise(buffer, { duration, gain: 0.006, lowpassHz: 450, highpassHz: 30, attack: 5, release: 6, seed: 45 });
  return buffer;
}

function renderRainLoop(buffer, duration) {
  addNoise(buffer, { duration, gain: 0.045, lowpassHz: 1400, highpassHz: 160, attack: 1.2, release: 1.2, seed: 90 });
  addNoise(buffer, {
    duration,
    gain: 0.03,
    lowpassHz: 900,
    highpassHz: 70,
    seed: 91,
    pulse: (t) => 0.45 + Math.pow(Math.max(0, Math.sin(t * 23.7) * Math.sin(t * 11.1)), 3) * 1.8,
  });
  return buffer;
}

function renderRoomNight(buffer, duration) {
  addTone(buffer, { duration, frequency: 58, type: "sine", gain: 0.012, attack: 3, release: 4 });
  addNoise(buffer, { duration, gain: 0.006, lowpassHz: 320, highpassHz: 40, attack: 2, release: 3, seed: 120 });
  return buffer;
}

function renderCorridorHum(buffer, duration) {
  addTone(buffer, { duration, frequency: 50, type: "sine", gain: 0.032, attack: 2.5, release: 3 });
  addTone(buffer, { duration, frequency: 100, type: "sine", gain: 0.012, attack: 2.5, release: 3 });
  addTone(buffer, { duration, frequency: (t) => 146 + Math.sin(t * 0.5) * 2, type: "triangle", gain: 0.006, attack: 3, release: 3 });
  addNoise(buffer, { duration, gain: 0.006, lowpassHz: 430, highpassHz: 60, attack: 2, release: 2, seed: 130 });
  return buffer;
}

function renderPhoneVibrate(buffer) {
  [0, 0.18, 0.36].forEach((t) => addTone(buffer, { start: t, duration: 0.12, frequency: 118, type: "triangle", gain: 0.35, attack: 0.01, release: 0.05, panLfo: 24 }));
  return buffer;
}

function renderDeadCallRing(buffer) {
  [0.05, 0.52, 0.95].forEach((t) => {
    addTone(buffer, { start: t, duration: 0.28, frequency: 512, type: "sine", gain: 0.2, attack: 0.03, release: 0.08 });
    addTone(buffer, { start: t, duration: 0.28, frequency: 768, type: "triangle", gain: 0.08, attack: 0.03, release: 0.08 });
  });
  addNoise(buffer, { duration: buffer.length / sampleRate, gain: 0.008, lowpassHz: 1000, highpassHz: 180, seed: 201 });
  return buffer;
}

function renderMessagePop(buffer) {
  addTone(buffer, { start: 0.02, duration: 0.12, frequency: 690, type: "triangle", gain: 0.18, attack: 0.006, release: 0.07 });
  addTone(buffer, { start: 0.1, duration: 0.13, frequency: 980, type: "sine", gain: 0.08, attack: 0.006, release: 0.08 });
  return buffer;
}

function renderDoorbell(buffer) {
  addTone(buffer, { start: 0.04, duration: 0.55, frequency: 392, type: "sine", gain: 0.19, attack: 0.02, release: 0.18 });
  addTone(buffer, { start: 0.38, duration: 0.54, frequency: 330, type: "sine", gain: 0.15, attack: 0.02, release: 0.22 });
  return buffer;
}

function renderKnockSoft(buffer) {
  [0.08, 0.31, 0.56].forEach((t, i) => addImpulse(buffer, t, 0.22 - i * 0.03, 160, 0.12, 0.025));
  return buffer;
}

function renderDoorChain(buffer) {
  [0.05, 0.15, 0.28, 0.42].forEach((t, i) => addImpulse(buffer, t, 0.19 - i * 0.025, 520 + i * 90, 0.11, 0.018));
  return buffer;
}

function renderDoorLock(buffer) {
  addImpulse(buffer, 0.08, 0.18, 260, 0.18, 0.02);
  addTone(buffer, { start: 0.22, duration: 0.28, frequency: (t) => 180 + t * 280, type: "triangle", gain: 0.09, attack: 0.02, release: 0.12 });
  addImpulse(buffer, 0.55, 0.13, 340, 0.12, 0.014);
  return buffer;
}

function renderDoorOpen(buffer) {
  addNoise(buffer, { start: 0.08, duration: 1.35, gain: 0.055, lowpassHz: 620, highpassHz: 90, attack: 0.12, release: 0.45, seed: 255 });
  addTone(buffer, { start: 0.16, duration: 1.2, frequency: (t) => 95 + Math.sin(t * 8) * 8, type: "triangle", gain: 0.035, attack: 0.08, release: 0.35 });
  addImpulse(buffer, 1.48, 0.12, 180, 0.18, 0.012);
  return buffer;
}

function renderWetFootsteps(buffer) {
  [0.09, 0.58, 1.03].forEach((t, i) => {
    addImpulse(buffer, t, 0.12, 120 + i * 12, 0.11, 0.018);
    addNoise(buffer, { start: t + 0.02, duration: 0.18, gain: 0.055, lowpassHz: 850, highpassHz: 100, attack: 0.01, release: 0.14, seed: 300 + i });
  });
  return buffer;
}

function renderLightFlicker(buffer) {
  [0.05, 0.17, 0.31, 0.72].forEach((t, i) => {
    addTone(buffer, { start: t, duration: 0.07, frequency: 118 + i * 18, type: "triangle", gain: 0.08, attack: 0.004, release: 0.04 });
    addNoise(buffer, { start: t, duration: 0.05, gain: 0.018, lowpassHz: 1100, highpassHz: 160, attack: 0.002, release: 0.035, seed: 340 + i });
  });
  addTone(buffer, { duration: buffer.length / sampleRate, frequency: 60, type: "sine", gain: 0.018, attack: 0.02, release: 0.08 });
  return buffer;
}

function renderOldPhoneStart(buffer) {
  addTone(buffer, { start: 0.04, duration: 0.18, frequency: 240, type: "square", gain: 0.07, attack: 0.006, release: 0.08 });
  addTone(buffer, { start: 0.2, duration: 0.4, frequency: (t) => 420 + Math.sin(t * 24) * 20, type: "triangle", gain: 0.08, attack: 0.03, release: 0.18 });
  addNoise(buffer, { start: 0.12, duration: 0.68, gain: 0.015, lowpassHz: 1800, highpassHz: 220, attack: 0.02, release: 0.25, seed: 410 });
  return buffer;
}

function renderRecordingStatic(buffer) {
  addNoise(buffer, { start: 0.03, duration: 0.42, gain: 0.04, lowpassHz: 1400, highpassHz: 180, attack: 0.01, release: 0.18, seed: 420 });
  addTone(buffer, { start: 0.06, duration: 0.32, frequency: 185, type: "sine", gain: 0.025, attack: 0.02, release: 0.12 });
  return buffer;
}

function renderPhotoZoom(buffer) {
  addTone(buffer, { start: 0.02, duration: 0.22, frequency: (t) => 360 + t * 620, type: "sine", gain: 0.11, attack: 0.01, release: 0.08 });
  addTone(buffer, { start: 0.13, duration: 0.18, frequency: 680, type: "triangle", gain: 0.04, attack: 0.01, release: 0.09 });
  return buffer;
}

function renderMarkerCircle(buffer) {
  addNoise(buffer, { start: 0.02, duration: 0.28, gain: 0.042, lowpassHz: 1200, highpassHz: 160, attack: 0.02, release: 0.08, seed: 430 });
  addTone(buffer, { start: 0.05, duration: 0.24, frequency: 260, type: "triangle", gain: 0.045, attack: 0.02, release: 0.08 });
  return buffer;
}

function renderChoiceConfirm(buffer) {
  addTone(buffer, { start: 0.01, duration: 0.1, frequency: 520, type: "triangle", gain: 0.08, attack: 0.004, release: 0.06 });
  addTone(buffer, { start: 0.08, duration: 0.1, frequency: 720, type: "sine", gain: 0.035, attack: 0.004, release: 0.06 });
  return buffer;
}

function renderLinzhouGasp(buffer) {
  addBreath(buffer, 0.05, 0.38, 0.16, 501, 145);
  return buffer;
}

function renderLinzhouBreath(buffer) {
  addBreath(buffer, 0.1, 0.48, 0.08, 510, 135);
  addBreath(buffer, 0.86, 0.48, 0.075, 511, 128);
  return buffer;
}

function renderXuzhiwanBreath(buffer) {
  addBreath(buffer, 0.12, 0.86, 0.075, 520, 220);
  addNoise(buffer, { start: 0.2, duration: 0.8, gain: 0.01, lowpassHz: 700, highpassHz: 80, seed: 521 });
  return buffer;
}

function renderXuzhiwanStep(buffer) {
  [0.1, 0.48].forEach((t, i) => {
    addImpulse(buffer, t, 0.1, 135, 0.1, 0.02);
    addNoise(buffer, { start: t + 0.03, duration: 0.18, gain: 0.052, lowpassHz: 800, highpassHz: 120, seed: 530 + i });
  });
  return buffer;
}

function renderZhouyuLaugh(buffer) {
  addBreath(buffer, 0.1, 0.45, 0.08, 540, 105);
  addTone(buffer, { start: 0.12, duration: 0.48, frequency: (t) => 92 + Math.sin(t * 16) * 7, type: "sine", gain: 0.04, attack: 0.08, release: 0.25 });
  return buffer;
}

function renderZhouyuBreath(buffer) {
  addBreath(buffer, 0.12, 0.84, 0.08, 550, 105);
  addTone(buffer, { start: 0.2, duration: 0.8, frequency: 74, type: "sine", gain: 0.025, attack: 0.14, release: 0.3 });
  return buffer;
}

function renderXuzhixiaBreath(buffer) {
  addBreath(buffer, 0.12, 0.72, 0.065, 560, 215);
  addNoise(buffer, { start: 0.06, duration: 0.98, gain: 0.026, lowpassHz: 1200, highpassHz: 180, seed: 561 });
  addTone(buffer, { start: 0.18, duration: 0.52, frequency: 330, type: "sine", gain: 0.012, attack: 0.06, release: 0.18 });
  return buffer;
}

function renderRecordingCut(buffer) {
  addNoise(buffer, { start: 0.02, duration: 0.12, gain: 0.07, lowpassHz: 1500, highpassHz: 220, seed: 570 });
  addTone(buffer, { start: 0.05, duration: 0.16, frequency: (t) => 310 - t * 860, type: "triangle", gain: 0.075, attack: 0.003, release: 0.09 });
  return buffer;
}

function encodeWav(buffer) {
  const bytesPerSample = 2;
  const dataSize = buffer.length * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return Buffer.from(arrayBuffer);
}

function writeString(view, offset, text) {
  for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}
