import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { EdgeTTS } from "node-edge-tts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const args = parseArgs(process.argv.slice(2));
const provider = args.provider || process.env.VOICE_PROVIDER || "elevenlabs";
const dryRun = args["dry-run"] === true;
const strictProvider = args.strict === true;
const placeholderMode = args.placeholder === true || provider === "edge";

loadDotEnv(path.join(rootDir, ".env"));
const strictCharacterLock = String(process.env.VOICE_STRICT_CHARACTER_LOCK || "true").toLowerCase() !== "false";

const storyData = loadWindowScript("story-data.js", "MIST_DATA");
const audioAssets = loadWindowScript("assets/audio/audio-assets.js", "SECOND_LIFE_AUDIO");
const voiceTodoPath = path.join(rootDir, "assets/audio/voice/VOICE_TODO.md");
const voiceTodoText = fs.existsSync(voiceTodoPath) ? fs.readFileSync(voiceTodoPath, "utf8") : "";

const firstBatch = [
  task("narration", "narrator", "narration_ch01_001", "assets/audio/narration/narration_ch01_001.mp3", "暴雨把窗户拍得发白。林舟盯着电脑里还没写完的周报，泡面汤已经凉透，杯沿留着半圈咖啡渍。", "低沉、克制、悬疑档案感，语速偏慢，不要播音腔"),
  task("narration", "narrator", "narration_ch01_003", "assets/audio/narration/narration_ch01_003.mp3", "手机突然震动。来电显示跳出来的名字，让林舟的手停在键盘上。许知夏。", "前半句平稳，许知夏前明显停顿，名字压低"),
  task("narration", "narrator", "narration_ch01_008", "assets/audio/narration/narration_ch01_008.mp3", "猫眼外站着一个浑身湿透的女人。她抬头时，林舟差点后退。那张脸和许知夏太像了。", "低声，画面感强，太像了带冷意"),
  task("narration", "narrator", "narration_ch01_020", "assets/audio/narration/narration_ch01_020.mp3", "门外的许知晚听见这个名字，忽然安静了。楼道灯闪了一下，把猫眼里的她切成一张潮湿的旧照片。", "语速慢，气氛压低，忽然安静了之后停顿，最后一句有旧照片感"),
  task("voice", "xuzhixia", "voice_xuzhixia_ch01_005", "assets/audio/voice/xuzhixia/voice_xuzhixia_ch01_005.mp3", "别开门，她不是我。", "旧手机录音感，虚弱急促，带轻微电流底噪，她不是我明显压低"),
  task("voice", "xuzhixia", "voice_xuzhixia_ch05_005", "assets/audio/voice/xuzhixia/voice_xuzhixia_ch05_005.mp3", "如果这段被恢复，说明我没来得及见到林舟。", "旧录音感，克制疲惫，像提前留下的备忘"),
  task("voice", "xuzhixia", "voice_xuzhixia_ch05_011", "assets/audio/voice/xuzhixia/voice_xuzhixia_ch05_011.mp3", "周屿他……如果我出事，不要相信他说那晚不在。照片——", "压着恐惧，周屿他之后停顿，后半句急促，照片突然中断"),
  task("voice", "xuzhixia", "voice_xuzhixia_ch05_015", "assets/audio/voice/xuzhixia/voice_xuzhixia_ch05_015.mp3", "如果来得及，把那张合照留下来。", "很轻，像留给未来的一句话，带遗憾，不要太恐怖"),
  task("narration", "narrator", "narration_ch05_015", "assets/audio/narration/narration_ch05_015.mp3", "录屏最后弹出恢复记录：旧手机开机后，三年前的语音备忘被云端提醒触发。死者来电终于有了现实解释。", "低沉、克制，把灵异感拉回现实，但不要像说明书"),
  task("voice", "xuzhiwan", "voice_xuzhiwan_ch01_007", "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_007.mp3", "林舟？我是许知晚。许知夏的妹妹。雨太大了，你先别怕。", "门外低声，成熟冷艳，雨夜压迫感，不甜美"),
  task("voice", "xuzhiwan", "voice_xuzhiwan_ch01_011", "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_011.mp3", "她怕黑。不是夜灯那种黑，是楼梯间突然停电的黑。", "低声，回忆感，情绪克制，楼梯间突然停电的黑压低"),
  task("voice", "xuzhiwan", "voice_xuzhiwan_ch01_016", "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch01_016.mp3", "你可以报警。但在他们来之前，你先看一眼我发给你的东西。别让周屿知道。", "冷静，语速偏慢，别让周屿知道明显压低"),
  task("voice", "xuzhiwan", "voice_xuzhiwan_ch02_001", "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_001.mp3", "他给你发消息了，对不对？", "低声试探，像已经知道答案，不要疑问过度"),
  task("voice", "xuzhiwan", "voice_xuzhiwan_ch02_003", "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_003.mp3", "因为三年前，他也是这样先让所有人闭嘴。", "冷、慢、压抑怒意，闭嘴两个字有压迫感"),
  task("voice", "xuzhiwan", "voice_xuzhiwan_ch02_005", "assets/audio/voice/xuzhiwan/voice_xuzhiwan_ch02_005.mp3", "她高三那年离家出走，躲在图书馆天台。", "回忆，克制，有难过但不哭，语气稳定"),
  task("voice", "zhouyu", "voice_zhouyu_ch04_020", "assets/audio/voice/zhouyu/voice_zhouyu_ch04_020.mp3", "林舟，你刚刚找到那张合照，对吗？", "低沉贴近，像知道玩家刚做了什么，对吗前停顿"),
  task("voice", "chenyan", "voice_chenyan_ch01_009", "assets/audio/voice/chenyan/voice_chenyan_ch01_009.mp3", "你最好别开门。还有，把门链扣上。", "干练、直接、稍快，现实支撑感"),
  task("voice", "chenyan", "voice_chenyan_ch02_007", "assets/audio/voice/chenyan/voice_chenyan_ch02_007.mp3", "截图收到了。周屿？你大学那个老好人？他为什么半夜盯着你家门口？", "前半句清醒，周屿有疑惑，后半句明显警觉"),
  task("voice", "linzhou", "voice_linzhou_ch01_002", "assets/audio/voice/linzhou/voice_linzhou_ch01_002.mp3", "再改一版……就睡。", "疲惫、普通上班族，声音低，像熬夜加班后的自言自语"),
  task("voice", "linzhou", "voice_linzhou_ch01_004", "assets/audio/voice/linzhou/voice_linzhou_ch01_004.mp3", "不可能。", "短促、震惊、压低，像看到不该出现的名字"),
  task("voice", "linzhou", "voice_linzhou_ch01_019", "assets/audio/voice/linzhou/voice_linzhou_ch01_019.mp3", "周屿怎么会知道门外有人？", "疑惑、紧张，语速略快，最后带恐惧"),
  task("voice", "linzhou", "voice_linzhou_ch02_002", "assets/audio/voice/linzhou/voice_linzhou_ch02_002.mp3", "你怎么知道？", "压低声音，带防备，问句不要太大声"),
];

const tasks = args.all ? mergeTasks(firstBatch, parseTodoTasks(voiceTodoText)) : firstBatch;

console.log(`voice provider: ${provider}${dryRun ? " (dry-run)" : ""}`);
console.log(`placeholder mode: ${placeholderMode ? "yes (not-final)" : "no"}`);
console.log(`strict character lock: ${strictCharacterLock ? "on" : "off"}`);
console.log(`story nodes: ${Object.keys(storyData.nodes || {}).length}`);
console.log(`voice profiles: ${Object.keys(audioAssets.voiceProfiles || {}).join(", ")}`);
console.log(`planned files: ${tasks.length}`);

for (const item of tasks) {
  const voiceBinding = getVoiceBinding(item.profileId);
  const finalStatus = placeholderMode
    ? "no (placeholder / need-retake)"
    : voiceBinding.voiceId
      ? "yes"
      : "blocked (missing fixed voice id)";
  console.log(`- role=${item.profileId} voiceId=${voiceBinding.voiceId || "(missing)"} emotion="${item.direction}" output=${item.outputPath} final=${finalStatus}`);
  if (dryRun) continue;
  await generateTask(item);
}

if (!dryRun) {
  updateAudioAssets(tasks);
  console.log("updated assets/audio/audio-assets.js");
}

function task(category, profileId, key, outputPath, text, direction = "") {
  return { category, profileId, key, outputPath, text, direction };
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const name = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[name] = true;
    } else {
      parsed[name] = next;
      index += 1;
    }
  }
  return parsed;
}

function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadWindowScript(relativePath, globalName) {
  const script = fs.readFileSync(path.join(rootDir, relativePath), "utf8");
  const context = { window: {}, console };
  context.window.window = context.window;
  vm.createContext(context);
  vm.runInContext(script, context, { filename: relativePath });
  return context.window[globalName];
}

function parseTodoTasks(markdown) {
  const items = [];
  const blockRegex = /###\s+([a-z0-9_]+)\.mp3[\s\S]*?- 路径：`([^`]+)`[\s\S]*?- 文本：([^\n]+)[\s\S]*?- 情绪：([^\n]+)?/gi;
  let match;
  while ((match = blockRegex.exec(markdown))) {
    const key = match[1];
    const outputPath = match[2];
    const text = match[3].trim();
    const direction = (match[4] || "").trim();
    const category = key.startsWith("narration_") ? "narration" : "voice";
    const profileId = key.includes("linzhou")
      ? "linzhou"
      : key.includes("xuzhiwan")
        ? "xuzhiwan"
        : key.includes("zhouyu")
          ? "zhouyu"
          : key.includes("chenyan")
            ? "chenyan"
            : key.includes("xuzhixia")
              ? "xuzhixia"
              : "narrator";
    items.push(task(category, profileId, key, outputPath, text, direction));
  }
  return items;
}

function mergeTasks(primary, extra) {
  const map = new Map();
  for (const item of [...primary, ...extra]) map.set(item.key, item);
  return [...map.values()];
}

async function generateTask(item) {
  const absoluteOut = path.join(rootDir, item.outputPath);
  fs.mkdirSync(path.dirname(absoluteOut), { recursive: true });
  if (provider === "elevenlabs") {
    if (!process.env.ELEVENLABS_API_KEY) {
      if (!placeholderMode) {
        throw new Error("Missing ELEVENLABS_API_KEY. Use --dry-run to inspect tasks or --provider edge --placeholder for dev placeholder audio.");
      }
    } else {
      assertLockedVoice(item.profileId);
      await generateWithElevenLabs(item, absoluteOut);
      return;
    }
  }
  if (provider === "elevenlabs" && process.env.ELEVENLABS_API_KEY) {
    await generateWithElevenLabs(item, absoluteOut);
    return;
  }
  if (provider === "azure" && process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
    throw new Error("Azure provider is reserved but not implemented yet. Use ElevenLabs or Edge fallback.");
  }
  if (!placeholderMode || strictProvider) {
    throw new Error(`Missing formal provider credentials for ${provider}. Edge TTS is only allowed with --provider edge --placeholder and must be marked need-retake.`);
  }
  console.warn(`Generating DEV PLACEHOLDER ${item.key} with Edge neural TTS. This is not final and must be retaken.`);
  await generateWithEdgeTts(item, absoluteOut);
}

async function generateWithElevenLabs(item, absoluteOut) {
  const { voiceId, envKey } = getVoiceBinding(item.profileId);
  if (!voiceId) throw new Error(`Missing ElevenLabs voice id for ${item.profileId}: ${envKey}`);
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: enrichText(item),
      model_id: "eleven_multilingual_v2",
      voice_settings: getElevenLabsSettings(item.profileId),
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ElevenLabs failed for ${item.key}: ${response.status} ${body}`);
  }
  fs.writeFileSync(absoluteOut, Buffer.from(await response.arrayBuffer()));
}

function getVoiceBinding(profileId) {
  const profile = audioAssets.voiceProfiles?.[profileId] || {};
  const envKey = profile.voiceEnvKey || `ELEVENLABS_VOICE_${profileId.toUpperCase()}`;
  return { envKey, voiceId: process.env[envKey] || "" };
}

function assertLockedVoice(profileId) {
  const { envKey, voiceId } = getVoiceBinding(profileId);
  if (strictCharacterLock && !voiceId) {
    throw new Error(`VOICE_STRICT_CHARACTER_LOCK is enabled. Missing fixed voice id for ${profileId}: ${envKey}`);
  }
  if (strictCharacterLock && profileId !== "narrator" && envKey === "ELEVENLABS_VOICE_NARRATOR") {
    throw new Error(`VOICE_STRICT_CHARACTER_LOCK forbids using narrator voice for role ${profileId}`);
  }
}

async function generateWithEdgeTts(item, absoluteOut) {
  const config = getEdgeConfig(item.profileId);
  const tts = new EdgeTTS({
    voice: config.voice,
    lang: "zh-CN",
    outputFormat: "audio-24khz-96kbitrate-mono-mp3",
    pitch: config.pitch,
    rate: config.rate,
    volume: config.volume,
    timeout: 30000,
  });
  await tts.ttsPromise(enrichText(item), absoluteOut);
}

function enrichText(item) {
  if (item.profileId === "xuzhixia") return `${item.text}`;
  if (item.profileId === "zhouyu") return item.text.replace(/，/g, "， ");
  return item.text;
}

function getEdgeConfig(profileId) {
  const configs = {
    narrator: { voice: "zh-CN-YunyangNeural", pitch: "-8%", rate: "-12%", volume: "default" },
    linzhou: { voice: "zh-CN-YunxiNeural", pitch: "-6%", rate: "-4%", volume: "default" },
    xuzhiwan: { voice: "zh-CN-XiaoyiNeural", pitch: "-8%", rate: "-10%", volume: "default" },
    zhouyu: { voice: "zh-CN-YunyangNeural", pitch: "-12%", rate: "-12%", volume: "default" },
    chenyan: { voice: "zh-CN-XiaoyiNeural", pitch: "+2%", rate: "+8%", volume: "default" },
    xuzhixia: { voice: "zh-CN-XiaoxiaoNeural", pitch: "-5%", rate: "-18%", volume: "-8%" },
  };
  return configs[profileId] || configs.narrator;
}

function getElevenLabsSettings(profileId) {
  const settings = {
    narrator: { stability: 0.72, similarity_boost: 0.78, style: 0.18, use_speaker_boost: true },
    linzhou: { stability: 0.58, similarity_boost: 0.72, style: 0.22, use_speaker_boost: true },
    xuzhiwan: { stability: 0.68, similarity_boost: 0.82, style: 0.26, use_speaker_boost: true },
    zhouyu: { stability: 0.74, similarity_boost: 0.84, style: 0.28, use_speaker_boost: true },
    chenyan: { stability: 0.56, similarity_boost: 0.72, style: 0.18, use_speaker_boost: true },
    xuzhixia: { stability: 0.62, similarity_boost: 0.78, style: 0.34, use_speaker_boost: true },
  };
  return settings[profileId] || settings.narrator;
}

function updateAudioAssets(items) {
  const audioPath = path.join(rootDir, "assets/audio/audio-assets.js");
  let source = fs.readFileSync(audioPath, "utf8");
  source = updateMapBlock(source, "narration", items.filter((item) => item.category === "narration"));
  source = updateMapBlock(source, "voice", items.filter((item) => item.category === "voice"));
  fs.writeFileSync(audioPath, source, "utf8");
}

function updateMapBlock(source, blockName, items) {
  if (!items.length) return source;
  const existing = {};
  const currentBlock = source.match(new RegExp(`  ${blockName}: \\{([\\s\\S]*?)\\n  \\},`));
  if (currentBlock) {
    const entryRegex = /([a-z0-9_]+):\s*"([^"]+)"/gi;
    let match;
    while ((match = entryRegex.exec(currentBlock[1]))) existing[match[1]] = match[2];
  }
  for (const item of items) existing[item.key] = item.outputPath.replace(/\\/g, "/");
  const entries = Object.entries(existing)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `    ${key}: "${value}",`)
    .join("\n");
  return source.replace(new RegExp(`  ${blockName}: \\{[\\s\\S]*?\\n  \\},`), `  ${blockName}: {\n${entries}\n  },`);
}
