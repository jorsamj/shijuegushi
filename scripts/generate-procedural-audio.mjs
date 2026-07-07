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
  ["sfx/sfx_phone_call_end.wav", 0.42, renderPhoneCallEnd],
  ["sfx/sfx_phone_screen_wake.wav", 0.38, renderPhoneScreenWake],
  ["sfx/sfx_chat_typing_short.wav", 0.58, renderChatTypingShort],
  ["sfx/sfx_evidence_reveal.wav", 0.72, renderEvidenceReveal],
  ["sfx/sfx_old_photo_pickup.wav", 0.64, renderOldPhotoPickup],
  ["sfx/sfx_photo_reflection_find.wav", 0.68, renderPhotoReflectionFind],
  ["sfx/sfx_backup_start.wav", 0.62, renderBackupStart],
  ["sfx/sfx_backup_success.wav", 0.7, renderBackupSuccess],
  ["sfx/sfx_delete_warning.wav", 0.82, renderDeleteWarning],
  ["sfx/sfx_archive_stamp.wav", 0.72, renderArchiveStamp],
  ["sfx/sfx_rain_window_soft.wav", 0.9, renderRainWindowSoft],
  ["sfx/sfx_room_silence_drop.wav", 0.7, renderRoomSilenceDrop],
  ["stingers/linzhou_gasp_short.wav", 0.62, renderLinzhouGasp],
  ["stingers/linzhou_breath_tense.wav", 1.55, renderLinzhouBreath],
  ["stingers/xuzhiwan_low_breath.wav", 1.25, renderXuzhiwanBreath],
  ["stingers/xuzhiwan_step_wet.wav", 0.85, renderXuzhiwanStep],
  ["stingers/zhouyu_low_laugh.wav", 0.95, renderZhouyuLaugh],
  ["stingers/zhouyu_pressure_breath.wav", 1.3, renderZhouyuBreath],
  ["stingers/xuzhixia_static_breath.wav", 1.2, renderXuzhixiaBreath],
  ["stingers/xuzhixia_recording_cut.wav", 0.42, renderRecordingCut],
  ["stingers/linzhou_swallow_tense.wav", 0.58, renderLinzhouSwallow],
  ["stingers/linzhou_heartbeat_soft.wav", 1.4, renderLinzhouHeartbeat],
  ["stingers/xuzhiwan_cold_exhale.wav", 1.0, renderXuzhiwanColdExhale],
  ["stingers/xuzhiwan_sleeve_drip.wav", 0.9, renderSleeveDrip],
  ["stingers/zhouyu_phone_silence.wav", 1.25, renderZhouyuPhoneSilence],
  ["stingers/zhouyu_tiny_smile.wav", 0.74, renderZhouyuTinySmile],
  ["stingers/xuzhixia_weak_static_exhale.wav", 1.15, renderXuzhixiaWeakExhale],
  ["stingers/xuzhixia_memory_fade.wav", 0.82, renderXuzhixiaMemoryFade],
];

for (const [relativePath, duration, renderer] of manifest) {
  const buffer = renderer(createBuffer(duration), duration);
  normalize(buffer, targetPeak(relativePath));
  fade(buffer, 0.01, 0.025);
  const filePath = path.join(outRoot, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSafely(filePath, encodeWav(buffer));
  rendered.push({ path: path.relative(root, filePath).replace(/\\/g, "/"), duration: buffer.length / sampleRate });
}

for (const item of rendered) {
  console.log(`${item.path} ${item.duration.toFixed(2)}s`);
}
console.log(`Generated ${rendered.length} procedural WAV assets.`);

function writeFileSafely(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, data);
  try {
    fs.renameSync(tmpPath, filePath);
  } catch (error) {
    fs.copyFileSync(tmpPath, filePath);
    fs.unlinkSync(tmpPath);
  }
}

function targetPeak(relativePath) {
  if (relativePath.startsWith("bgm/")) return 0.22;
  if (relativePath.startsWith("ambience/")) return 0.16;
  if (relativePath.startsWith("stingers/")) return 0.3;
  if (relativePath.includes("choice_confirm")) return 0.18;
  if (relativePath.includes("message_pop")) return 0.2;
  if (relativePath.includes("evidence") || relativePath.includes("backup")) return 0.24;
  if (relativePath.includes("doorbell") || relativePath.includes("phone_ring")) return 0.28;
  return 0.34;
}

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

function addWoodHit(buffer, time, gain = 0.18, bodyHz = 118, decay = 0.18) {
  addTone(buffer, {
    start: time,
    duration: decay,
    frequency: (t) => bodyHz * Math.pow(0.62, t / decay),
    type: "sine",
    gain,
    attack: 0.003,
    release: decay * 0.9,
  });
  addNoise(buffer, {
    start: time + 0.002,
    duration: decay * 0.72,
    gain: gain * 0.22,
    lowpassHz: 520,
    highpassHz: 65,
    attack: 0.002,
    release: decay * 0.62,
    seed: Math.floor(time * 10000) + 880,
  });
}

function addMetalTick(buffer, time, gain = 0.08, bodyHz = 360, decay = 0.12) {
  addNoise(buffer, {
    start: time,
    duration: decay,
    gain: gain,
    lowpassHz: 1800,
    highpassHz: 240,
    attack: 0.001,
    release: decay * 0.82,
    seed: Math.floor(time * 10000) + 930,
  });
  addTone(buffer, {
    start: time + 0.003,
    duration: decay * 0.75,
    frequency: (t) => bodyHz + Math.sin(t * 42) * 20,
    type: "sine",
    gain: gain * 0.42,
    attack: 0.002,
    release: decay * 0.65,
  });
}

function addSoftLowHit(buffer, time, gain = 0.12, frequency = 76, duration = 0.42) {
  addTone(buffer, {
    start: time,
    duration,
    frequency: (t) => frequency * Math.pow(0.72, t / duration),
    type: "sine",
    gain,
    attack: 0.015,
    release: duration * 0.72,
  });
  addNoise(buffer, {
    start: time,
    duration: duration * 0.55,
    gain: gain * 0.06,
    lowpassHz: 260,
    highpassHz: 25,
    attack: 0.01,
    release: duration * 0.45,
    seed: Math.floor(time * 10000) + 970,
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
  addTone(buffer, { duration, frequency: 39, type: "sine", gain: 0.028, attack: 8, release: 10, detune: 0.35 });
  addTone(buffer, { duration, frequency: (t) => 68 + Math.sin(t * 0.035) * 0.8, type: "sine", gain: 0.012, attack: 10, release: 10 });
  addTone(buffer, { start: 14, duration: duration - 18, frequency: (t) => 104 + Math.sin(t * 0.025) * 0.8, type: "sine", gain: 0.0035, attack: 12, release: 12 });
  addNoise(buffer, { duration, gain: 0.0024, lowpassHz: 240, highpassHz: 18, attack: 7, release: 8, seed: 21 });
  lowShelf(buffer, 0.92);
  return buffer;
}

function renderHorrorCorridorBgm(buffer, duration) {
  addTone(buffer, { duration, frequency: 34, type: "sine", gain: 0.034, attack: 7, release: 8, detune: 0.3 });
  addTone(buffer, { duration, frequency: (t) => 61 + Math.sin(t * 0.06) * 0.8, type: "sine", gain: 0.016, attack: 8, release: 9 });
  addTone(buffer, { start: 9, duration: duration - 14, frequency: (t) => 118 + Math.sin(t * 0.12) * 0.9, type: "sine", gain: 0.0038, attack: 11, release: 10 });
  addNoise(buffer, { duration, gain: 0.0022, lowpassHz: 210, highpassHz: 30, attack: 7, release: 8, seed: 31 });
  return buffer;
}

function renderEndingArchiveBgm(buffer, duration) {
  addTone(buffer, { duration, frequency: 45, type: "sine", gain: 0.026, attack: 9, release: 11 });
  addTone(buffer, { duration, frequency: (t) => 83 + Math.sin(t * 0.035) * 0.55, type: "sine", gain: 0.009, attack: 11, release: 12 });
  addNoise(buffer, { duration, gain: 0.0018, lowpassHz: 210, highpassHz: 18, attack: 9, release: 9, seed: 45 });
  return buffer;
}

function renderRainLoop(buffer, duration) {
  addNoise(buffer, { duration, gain: 0.009, lowpassHz: 330, highpassHz: 32, attack: 2.2, release: 2.2, seed: 90 });
  addNoise(buffer, {
    duration,
    gain: 0.005,
    lowpassHz: 430,
    highpassHz: 44,
    seed: 91,
    pulse: (t) => 0.18 + Math.pow(Math.max(0, Math.sin(t * 10.7) * Math.sin(t * 4.9)), 6) * 0.65,
  });
  return buffer;
}

function renderRoomNight(buffer, duration) {
  addTone(buffer, { duration, frequency: 55, type: "sine", gain: 0.004, attack: 4, release: 4 });
  addNoise(buffer, { duration, gain: 0.0025, lowpassHz: 220, highpassHz: 30, attack: 3, release: 3, seed: 120 });
  return buffer;
}

function renderCorridorHum(buffer, duration) {
  addTone(buffer, { duration, frequency: 48, type: "sine", gain: 0.011, attack: 4, release: 4 });
  addTone(buffer, { duration, frequency: 96, type: "sine", gain: 0.0035, attack: 4, release: 4 });
  addNoise(buffer, { duration, gain: 0.0016, lowpassHz: 180, highpassHz: 35, attack: 4, release: 4, seed: 130 });
  return buffer;
}

function renderPhoneVibrate(buffer) {
  [0.02, 0.18, 0.36].forEach((t, i) => {
    addTone(buffer, { start: t, duration: 0.14, frequency: 118 + i * 2, type: "sine", gain: 0.14, attack: 0.006, release: 0.05, panLfo: 38 });
    addTone(buffer, { start: t, duration: 0.16, frequency: 58, type: "sine", gain: 0.072, attack: 0.008, release: 0.06 });
    addNoise(buffer, { start: t, duration: 0.14, gain: 0.009, lowpassHz: 210, highpassHz: 35, attack: 0.004, release: 0.05, seed: 180 + i });
  });
  return buffer;
}

function renderDeadCallRing(buffer) {
  [0.04, 0.58, 1.04].forEach((t) => {
    addTone(buffer, { start: t, duration: 0.28, frequency: 214, type: "sine", gain: 0.085, attack: 0.045, release: 0.16 });
    addTone(buffer, { start: t, duration: 0.28, frequency: 257, type: "sine", gain: 0.041, attack: 0.05, release: 0.17 });
    addTone(buffer, { start: t, duration: 0.3, frequency: (lt) => 151 + Math.sin(lt * 17) * 1.5, type: "sine", gain: 0.018, attack: 0.05, release: 0.15 });
  });
  addNoise(buffer, { duration: buffer.length / sampleRate, gain: 0.0022, lowpassHz: 420, highpassHz: 70, seed: 201 });
  return buffer;
}

function renderMessagePop(buffer) {
  addMetalTick(buffer, 0.035, 0.018, 180, 0.07);
  addSoftLowHit(buffer, 0.08, 0.022, 72, 0.13);
  return buffer;
}

function renderDoorbell(buffer) {
  addTone(buffer, { start: 0.05, duration: 0.5, frequency: 174, type: "sine", gain: 0.078, attack: 0.045, release: 0.28 });
  addTone(buffer, { start: 0.42, duration: 0.5, frequency: 151, type: "sine", gain: 0.067, attack: 0.045, release: 0.3 });
  addNoise(buffer, { start: 0.04, duration: 0.92, gain: 0.0018, lowpassHz: 310, highpassHz: 62, seed: 218 });
  return buffer;
}

function renderKnockSoft(buffer) {
  [0.09, 0.43].forEach((t, i) => addWoodHit(buffer, t, 0.22 - i * 0.025, 86 + i * 4, 0.24));
  addNoise(buffer, { start: 0.08, duration: 0.62, gain: 0.006, lowpassHz: 180, highpassHz: 28, attack: 0.02, release: 0.2, seed: 231 });
  return buffer;
}

function renderDoorChain(buffer) {
  [0.05, 0.16, 0.3, 0.46].forEach((t, i) => addMetalTick(buffer, t, 0.075 - i * 0.008, 420 + i * 55, 0.1));
  return buffer;
}

function renderDoorLock(buffer) {
  addMetalTick(buffer, 0.07, 0.06, 260, 0.12);
  addNoise(buffer, { start: 0.18, duration: 0.3, gain: 0.035, lowpassHz: 760, highpassHz: 140, attack: 0.02, release: 0.12, seed: 244 });
  addTone(buffer, { start: 0.2, duration: 0.28, frequency: (t) => 118 + Math.sin(t * 18) * 7, type: "sine", gain: 0.035, attack: 0.03, release: 0.12 });
  addMetalTick(buffer, 0.55, 0.045, 330, 0.1);
  return buffer;
}

function renderDoorOpen(buffer) {
  addNoise(buffer, { start: 0.08, duration: 1.35, gain: 0.04, lowpassHz: 480, highpassHz: 65, attack: 0.14, release: 0.48, seed: 255 });
  addTone(buffer, { start: 0.14, duration: 1.15, frequency: (t) => 82 + Math.sin(t * 5) * 5, type: "sine", gain: 0.025, attack: 0.12, release: 0.38 });
  addWoodHit(buffer, 1.48, 0.09, 96, 0.2);
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
    addTone(buffer, { start: t, duration: 0.06, frequency: 98 + i * 10, type: "sine", gain: 0.035, attack: 0.004, release: 0.035 });
    addNoise(buffer, { start: t, duration: 0.045, gain: 0.008, lowpassHz: 850, highpassHz: 170, attack: 0.002, release: 0.03, seed: 340 + i });
  });
  addTone(buffer, { duration: buffer.length / sampleRate, frequency: 58, type: "sine", gain: 0.009, attack: 0.02, release: 0.08 });
  return buffer;
}

function renderOldPhoneStart(buffer) {
  addMetalTick(buffer, 0.04, 0.04, 260, 0.09);
  addTone(buffer, { start: 0.14, duration: 0.48, frequency: (t) => 118 + Math.sin(t * 10) * 4, type: "sine", gain: 0.03, attack: 0.04, release: 0.22 });
  addNoise(buffer, { start: 0.1, duration: 0.72, gain: 0.011, lowpassHz: 620, highpassHz: 90, attack: 0.03, release: 0.28, seed: 410 });
  return buffer;
}

function renderRecordingStatic(buffer) {
  addNoise(buffer, { start: 0.03, duration: 0.4, gain: 0.018, lowpassHz: 760, highpassHz: 130, attack: 0.012, release: 0.18, seed: 420 });
  addTone(buffer, { start: 0.08, duration: 0.28, frequency: 166, type: "sine", gain: 0.014, attack: 0.03, release: 0.14 });
  return buffer;
}

function renderPhotoZoom(buffer) {
  addNoise(buffer, { start: 0.03, duration: 0.22, gain: 0.012, lowpassHz: 420, highpassHz: 70, attack: 0.015, release: 0.09, seed: 421 });
  addSoftLowHit(buffer, 0.12, 0.026, 84, 0.2);
  return buffer;
}

function renderMarkerCircle(buffer) {
  addNoise(buffer, { start: 0.02, duration: 0.3, gain: 0.024, lowpassHz: 460, highpassHz: 80, attack: 0.025, release: 0.1, seed: 430 });
  addSoftLowHit(buffer, 0.22, 0.018, 70, 0.12);
  return buffer;
}

function renderChoiceConfirm(buffer) {
  addNoise(buffer, { start: 0.02, duration: 0.08, gain: 0.007, lowpassHz: 220, highpassHz: 45, attack: 0.008, release: 0.04, seed: 455 });
  addSoftLowHit(buffer, 0.04, 0.012, 58, 0.08);
  return buffer;
}

function renderPhoneCallEnd(buffer) {
  addNoise(buffer, { start: 0.02, duration: 0.12, gain: 0.018, lowpassHz: 620, highpassHz: 90, attack: 0.003, release: 0.055, seed: 500 });
  addSoftLowHit(buffer, 0.16, 0.055, 90, 0.16);
  return buffer;
}

function renderPhoneScreenWake(buffer) {
  addNoise(buffer, { start: 0.02, duration: 0.12, gain: 0.008, lowpassHz: 540, highpassHz: 100, attack: 0.01, release: 0.055, seed: 502 });
  addTone(buffer, { start: 0.04, duration: 0.17, frequency: 210, type: "sine", gain: 0.022, attack: 0.02, release: 0.08 });
  return buffer;
}

function renderChatTypingShort(buffer) {
  [0.04, 0.18, 0.33].forEach((t, i) => {
    addTone(buffer, { start: t, duration: 0.04, frequency: 520 + i * 70, type: "triangle", gain: 0.04, attack: 0.003, release: 0.025 });
    addImpulse(buffer, t, 0.035, 420 + i * 40, 0.035, 0.004);
  });
  return buffer;
}

function renderEvidenceReveal(buffer) {
  addSoftLowHit(buffer, 0.03, 0.064, 62, 0.44);
  addNoise(buffer, { start: 0.16, duration: 0.36, gain: 0.008, lowpassHz: 290, highpassHz: 42, attack: 0.05, release: 0.16, seed: 600 });
  return buffer;
}

function renderOldPhotoPickup(buffer) {
  addNoise(buffer, { start: 0.04, duration: 0.28, gain: 0.035, lowpassHz: 1050, highpassHz: 180, attack: 0.02, release: 0.12, seed: 610 });
  addNoise(buffer, { start: 0.32, duration: 0.18, gain: 0.018, lowpassHz: 900, highpassHz: 150, attack: 0.01, release: 0.1, seed: 611 });
  return buffer;
}

function renderPhotoReflectionFind(buffer) {
  addNoise(buffer, { start: 0.03, duration: 0.22, gain: 0.009, lowpassHz: 360, highpassHz: 54, attack: 0.02, release: 0.09, seed: 612 });
  addSoftLowHit(buffer, 0.25, 0.044, 66, 0.28);
  return buffer;
}

function renderBackupStart(buffer) {
  [0.04, 0.22, 0.4].forEach((t, i) => {
    addMetalTick(buffer, t, 0.022, 230 + i * 20, 0.07);
    addTone(buffer, { start: t + 0.025, duration: 0.09, frequency: 118 + i * 9, type: "sine", gain: 0.015, attack: 0.012, release: 0.05 });
  });
  return buffer;
}

function renderBackupSuccess(buffer) {
  addSoftLowHit(buffer, 0.04, 0.038, 82, 0.28);
  addNoise(buffer, { start: 0.31, duration: 0.1, gain: 0.006, lowpassHz: 240, highpassHz: 48, seed: 617 });
  return buffer;
}

function renderDeleteWarning(buffer) {
  addTone(buffer, { start: 0.02, duration: 0.3, frequency: 72, type: "sine", gain: 0.13, attack: 0.02, release: 0.12 });
  addTone(buffer, { start: 0.3, duration: 0.24, frequency: 96, type: "triangle", gain: 0.08, attack: 0.02, release: 0.11 });
  addNoise(buffer, { start: 0.08, duration: 0.4, gain: 0.008, lowpassHz: 500, highpassHz: 70, seed: 620 });
  return buffer;
}

function renderArchiveStamp(buffer) {
  addImpulse(buffer, 0.06, 0.18, 95, 0.18, 0.018);
  addNoise(buffer, { start: 0.08, duration: 0.16, gain: 0.04, lowpassHz: 500, highpassHz: 80, attack: 0.005, release: 0.08, seed: 630 });
  addTone(buffer, { start: 0.25, duration: 0.22, frequency: 140, type: "sine", gain: 0.05, attack: 0.02, release: 0.12 });
  return buffer;
}

function renderRainWindowSoft(buffer) {
  [0.04, 0.16, 0.27, 0.45, 0.63].forEach((t, i) => {
    addNoise(buffer, { start: t, duration: 0.09, gain: 0.014, lowpassHz: 520, highpassHz: 75, attack: 0.004, release: 0.05, seed: 640 + i });
  });
  addNoise(buffer, { duration: buffer.length / sampleRate, gain: 0.003, lowpassHz: 320, highpassHz: 55, seed: 649 });
  return buffer;
}

function renderRoomSilenceDrop(buffer) {
  addSoftLowHit(buffer, 0.02, 0.082, 72, 0.52);
  addNoise(buffer, { start: 0.05, duration: 0.25, gain: 0.0035, lowpassHz: 190, highpassHz: 26, seed: 650 });
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

function renderLinzhouSwallow(buffer) {
  addTone(buffer, { start: 0.08, duration: 0.18, frequency: (t) => 125 - t * 65, type: "sine", gain: 0.035, attack: 0.04, release: 0.1 });
  addNoise(buffer, { start: 0.1, duration: 0.2, gain: 0.018, lowpassHz: 450, highpassHz: 90, seed: 660 });
  return buffer;
}

function renderLinzhouHeartbeat(buffer) {
  [0.12, 0.86].forEach((t) => {
    addImpulse(buffer, t, 0.13, 58, 0.18, 0.004);
    addTone(buffer, { start: t, duration: 0.18, frequency: 62, type: "sine", gain: 0.055, attack: 0.01, release: 0.14 });
  });
  return buffer;
}

function renderXuzhiwanColdExhale(buffer) {
  addBreath(buffer, 0.08, 0.72, 0.052, 670, 205);
  addTone(buffer, { start: 0.16, duration: 0.55, frequency: 176, type: "sine", gain: 0.008, attack: 0.14, release: 0.22 });
  return buffer;
}

function renderSleeveDrip(buffer) {
  [0.12, 0.52].forEach((t, i) => {
    addImpulse(buffer, t, 0.065, 730 + i * 120, 0.09, 0.006);
    addNoise(buffer, { start: t, duration: 0.08, gain: 0.012, lowpassHz: 1000, highpassHz: 220, seed: 680 + i });
  });
  return buffer;
}

function renderZhouyuPhoneSilence(buffer) {
  addBreath(buffer, 0.18, 0.62, 0.035, 690, 92);
  addTone(buffer, { start: 0.05, duration: 1.0, frequency: 64, type: "sine", gain: 0.018, attack: 0.16, release: 0.35 });
  addNoise(buffer, { start: 0.08, duration: 0.95, gain: 0.004, lowpassHz: 260, highpassHz: 60, seed: 691 });
  return buffer;
}

function renderZhouyuTinySmile(buffer) {
  addBreath(buffer, 0.08, 0.36, 0.045, 700, 102);
  addTone(buffer, { start: 0.12, duration: 0.32, frequency: (t) => 96 + Math.sin(t * 18) * 4, type: "sine", gain: 0.024, attack: 0.08, release: 0.18 });
  return buffer;
}

function renderXuzhixiaWeakExhale(buffer) {
  addBreath(buffer, 0.12, 0.7, 0.043, 710, 205);
  addNoise(buffer, { start: 0.05, duration: 0.92, gain: 0.012, lowpassHz: 900, highpassHz: 150, seed: 711 });
  addTone(buffer, { start: 0.18, duration: 0.38, frequency: 310, type: "sine", gain: 0.006, attack: 0.08, release: 0.16 });
  return buffer;
}

function renderXuzhixiaMemoryFade(buffer) {
  addTone(buffer, { start: 0.02, duration: 0.42, frequency: (t) => 280 - t * 220, type: "triangle", gain: 0.05, attack: 0.02, release: 0.25 });
  addNoise(buffer, { start: 0.04, duration: 0.45, gain: 0.018, lowpassHz: 1000, highpassHz: 180, seed: 720 });
  addTone(buffer, { start: 0.46, duration: 0.18, frequency: 90, type: "sine", gain: 0.035, attack: 0.02, release: 0.11 });
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
