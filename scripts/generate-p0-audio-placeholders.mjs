import fs from "node:fs";
import path from "node:path";
import { EdgeTTS } from "node-edge-tts";

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

const sfxVoice = "zh-CN-XiaoyiNeural";
const maleVoice = "zh-CN-YunxiNeural";
const lowMaleVoice = "zh-CN-YunyangNeural";
const femaleVoice = "zh-CN-XiaoyiNeural";
const memoryVoice = "zh-CN-XiaoxiaoNeural";

const tasks = [
  sfx("assets/audio/sfx/sfx_phone_vibrate.mp3", "嗯。", "-35%", "-18%"),
  sfx("assets/audio/sfx/sfx_phone_ring_dead_call.mp3", "叮。叮。", "-24%", "-6%"),
  sfx("assets/audio/sfx/sfx_message_pop_cold.mp3", "叮。", "-32%", "-12%"),
  sfx("assets/audio/sfx/sfx_doorbell_rain_night.mp3", "咚。", "-30%", "-15%"),
  sfx("assets/audio/sfx/sfx_knock_soft.mp3", "笃。笃。", "-34%", "-18%"),
  sfx("assets/audio/sfx/sfx_door_chain_close.mp3", "咔。", "-34%", "-20%"),
  sfx("assets/audio/sfx/sfx_door_lock_turn.mp3", "咔哒。", "-32%", "-20%"),
  sfx("assets/audio/sfx/sfx_door_open_slow.mp3", "吱。", "-35%", "-22%"),
  sfx("assets/audio/sfx/sfx_footstep_corridor_wet.mp3", "嗒。嗒。", "-35%", "-16%"),
  sfx("assets/audio/sfx/sfx_corridor_light_flicker.mp3", "滋。", "-38%", "-24%"),
  sfx("assets/audio/sfx/sfx_old_phone_start.mp3", "滴。", "-32%", "-12%"),
  sfx("assets/audio/sfx/sfx_recording_static_short.mp3", "滋。", "-40%", "-26%"),
  sfx("assets/audio/sfx/sfx_photo_zoom.mp3", "嗒。", "-34%", "-8%"),
  sfx("assets/audio/sfx/sfx_marker_circle.mp3", "唰。", "-36%", "-10%"),
  sfx("assets/audio/sfx/sfx_choice_confirm_soft.mp3", "叮。", "-36%", "-6%"),
  sfx("assets/audio/sfx/sfx_rain_hit_window.mp3", "嗒。嗒。", "-38%", "-20%"),

  stinger("assets/audio/stingers/linzhou/linzhou_gasp_short.mp3", "呃。", maleVoice, "-22%", "-12%"),
  stinger("assets/audio/stingers/linzhou/linzhou_shocked_breath.mp3", "嘶。", maleVoice, "-26%", "-12%"),
  stinger("assets/audio/stingers/linzhou/linzhou_breath_tense.mp3", "哈。", maleVoice, "-28%", "-14%"),
  stinger("assets/audio/stingers/xuzhiwan/xuzhiwan_low_breath.mp3", "嗯。", femaleVoice, "-24%", "-18%"),
  stinger("assets/audio/stingers/xuzhiwan/xuzhiwan_soft_call_linzou.mp3", "林舟？", femaleVoice, "-12%", "-12%"),
  stinger("assets/audio/stingers/xuzhiwan/xuzhiwan_step_wet.mp3", "嗒。", femaleVoice, "-34%", "-18%"),
  stinger("assets/audio/stingers/zhouyu/zhouyu_low_laugh.mp3", "呵。", lowMaleVoice, "-24%", "-24%"),
  stinger("assets/audio/stingers/zhouyu/zhouyu_pressure_hum.mp3", "嗯。", lowMaleVoice, "-26%", "-24%"),
  stinger("assets/audio/stingers/zhouyu/zhouyu_pressure_breath.mp3", "哈。", lowMaleVoice, "-28%", "-26%"),
  stinger("assets/audio/stingers/chenyan/chenyan_alert_short.mp3", "别开门。", femaleVoice, "-8%", "+2%"),
  stinger("assets/audio/stingers/xuzhixia/xuzhixia_static_breath.mp3", "别。", memoryVoice, "-28%", "-20%"),
  stinger("assets/audio/stingers/xuzhixia/xuzhixia_recording_cut.mp3", "照片。", memoryVoice, "-30%", "-20%"),

  voice("assets/audio/voice/xuzhixia/voice_xuzhixia_ch01_005.mp3", "别开门，她不是我。", memoryVoice, "-10%", "-18%", "-8%"),
  voice("assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_007.mp3", "林舟？", femaleVoice, "-10%", "-12%"),
  voice("assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_003.mp3", "先让所有人闭嘴。", femaleVoice, "-12%", "-14%"),
  voice("assets/audio/voice/zhouyu/voice_zhouyu_ch04_020.mp3", "对吗？", lowMaleVoice, "-18%", "-20%"),
  voice("assets/audio/voice/chenyan/voice_chenyan_ch01_009.mp3", "别开门。", femaleVoice, "-6%", "+2%"),
  voice("assets/audio/voice/linzhou/voice_linzhou_ch01_004.mp3", "不可能。", maleVoice, "-12%", "-10%"),
];

for (const task of tasks) {
  await generate(task);
}

console.log(`Generated ${tasks.length} P0 placeholder audio files.`);

function sfx(outputPath, text, volume, pitch) {
  return { outputPath, text, voice: sfxVoice, rate: "+8%", pitch, volume };
}

function stinger(outputPath, text, voice, volume, pitch) {
  return { outputPath, text, voice, rate: "-8%", pitch, volume };
}

function voice(outputPath, text, voice, rate, pitch, volume = "default") {
  return { outputPath, text, voice, rate, pitch, volume };
}

async function generate(task) {
  const out = path.join(root, task.outputPath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const tts = new EdgeTTS({
    voice: task.voice,
    lang: "zh-CN",
    outputFormat: "audio-24khz-96kbitrate-mono-mp3",
    pitch: task.pitch,
    rate: task.rate,
    volume: task.volume,
    timeout: 30000,
  });
  await tts.ttsPromise(task.text, out);
  const size = fs.statSync(out).size;
  console.log(`${task.outputPath} ${size} bytes`);
}
