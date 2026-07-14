import childProcess from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import WebSocket from "ws";

const root = path.resolve(import.meta.dirname, "..");
const endpoint = "wss://openspeech.bytedance.com/api/v3/tts/bidirection";
const storyName = process.argv.find((arg) => arg.startsWith("--story="))?.slice(8) || "dormitory";
const probe = process.argv.includes("--probe");
const force = process.argv.includes("--force");
const allowSingleSpeaker = process.argv.includes("--allow-single-speaker");
const requestedIds = new Set((process.argv.find((arg) => arg.startsWith("--ids="))?.slice(6) || "").split(",").filter(Boolean));
const stories = {
  dormitory: { id: "script_dormitory_rollcall", file: "assets/stories/dormitory-rollcall/story-data.js", global: "MIST_DORMITORY_DATA", prefix: "dorm", audioRoot: "assets/stories/dormitory-rollcall/audio" },
  "rain-call": { id: "script_rain_call", file: "story-data.js", global: "MIST_DATA", prefix: "rain", audioRoot: "assets/stories/rain-call/audio" },
};
const story = stories[storyName];
if (!story) throw new Error("Use --story=dormitory or --story=rain-call.");

const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);
const roleBySpeaker = {
  Broadcast: "dorm_broadcast", "广播": "dorm_broadcast", "陈露": "chenlu", "Chen Lu": "chenlu", "沈妍": "shenyan", "Shen Yan": "shenyan",
  "吴阿姨": "manager_wu", "周婉宁": "zhouwanning", "许棠": "xutang", "赵晴": "zhaoqing", "林穗": "linsui",
  "林舟": "linzhou", "许知夏": "xuzhixia", "许知夏的声音": "xuzhixia", "许知晚": "xuzhiwan", "周屿": "zhouyu", "陈妍": "chenyan", "女人": "woman_at_door", "房东老太": "landlady",
};
const roleLabels = {
  dorm_broadcast: "宿舍广播", chenlu: "陈露", shenyan: "沈妍", manager_wu: "吴阿姨", zhouwanning: "周婉宁", xutang: "许棠", zhaoqing: "赵晴", linsui: "林穗",
  linzhou: "林舟", xuzhixia: "许知夏", xuzhiwan: "许知晚", zhouyu: "周屿", chenyan: "陈妍", woman_at_door: "门外女人", landlady: "房东老太",
};
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadData() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, story.file), "utf8"), context, { filename: story.file });
  return context.window[story.global];
}

function normaliseForSpeech(text) {
  return String(text || "")
    .replace(/00:17/g, "零点十七分")
    .replace(/00:44/g, "零点四十四分")
    .replace(/01:13/g, "一点十三分")
    .replace(/2014/g, "二零一四年")
    .replace(/417/g, "四一七")
    .replace(/\s+/g, " ")
    .trim();
}

function targetsFor(data) {
  return Object.values(data.nodes || {})
    .filter((node) => audibleTypes.has(node.contentType) && node.voiceEnabled === true && node.spokenText)
    .map((node) => {
      const roleId = roleBySpeaker[node.speaker];
      if (!roleId) throw new Error(`No Volcengine role mapping exists for ${node.nodeId} (${node.speaker}).`);
      return {
        id: node.nodeId,
        nodeId: node.nodeId,
        chapterId: node.chapterId,
        speaker: node.speaker,
        roleId,
        contentType: node.contentType,
        displayText: node.text,
        spokenText: normaliseForSpeech(node.spokenText),
        voiceDirection: node.voiceDirection || "像现场交流，不像朗读。",
      };
    });
}

function readManifest(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return { version: 2, provider: "volcengine-doubao-tts-websocket", storyId: story.id, entries: {} }; }
}

function saveManifest(file, manifest) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

function audioPaths() {
  const base = path.join(root, story.audioRoot);
  return { original: path.join(base, "voice-original"), manifest: path.join(base, "voice-manifest.json") };
}

function readSpeakerMap(requiredRoles) {
  const raw = process.env.VOLC_TTS_SPEAKER_MAP || "";
  let map = {};
  if (raw) {
    try { map = JSON.parse(raw); } catch { throw new Error("VOLC_TTS_SPEAKER_MAP must be valid JSON."); }
  }
  const fallback = process.env.VOLC_TTS_DEFAULT_SPEAKER || "";
  const missing = requiredRoles.filter((role) => !map[role]);
  if (missing.length && fallback && allowSingleSpeaker) missing.forEach((role) => { map[role] = fallback; });
  if (missing.length && !allowSingleSpeaker) {
    throw new Error(`Missing approved Volcengine speaker IDs for: ${missing.map((role) => roleLabels[role] || role).join("、")}。Provide VOLC_TTS_SPEAKER_MAP; a single fallback voice is intentionally blocked for formal multi-character production.`);
  }
  return map;
}

function config() {
  const apiKey = process.env.VOLC_TTS_API_KEY || "";
  const resourceId = process.env.VOLC_TTS_RESOURCE_ID || "seed-tts-2.0";
  if (!apiKey) throw new Error("VOLC_TTS_API_KEY is required. No fallback provider will be used.");
  return { apiKey, resourceId };
}

const MsgType = { FullClientRequest: 1, FullServerResponse: 9, AudioOnlyServer: 11, Error: 15 };
const Flag = { NoSeq: 0, PositiveSeq: 1, NegativeSeq: 3, WithEvent: 4 };
const Event = { StartConnection: 1, FinishConnection: 2, ConnectionStarted: 50, ConnectionFailed: 51, StartSession: 100, FinishSession: 102, SessionStarted: 150, SessionFinished: 152, SessionFailed: 153, TaskRequest: 200, TTSResponse: 352 };

function jsonPayload(value) { return Buffer.from(JSON.stringify(value), "utf8"); }
function encodeMessage(event, sessionId, payload = {}) {
  const isConnectionEvent = [Event.StartConnection, Event.FinishConnection].includes(event);
  const chunks = [Buffer.from([0x11, (MsgType.FullClientRequest << 4) | Flag.WithEvent, 0x10, 0]), Buffer.alloc(4)];
  chunks[1].writeInt32BE(event);
  if (!isConnectionEvent) {
    const session = Buffer.from(sessionId, "utf8");
    const length = Buffer.alloc(4); length.writeUInt32BE(session.length);
    chunks.push(length, session);
  }
  const body = jsonPayload(payload);
  const bodyLength = Buffer.alloc(4); bodyLength.writeUInt32BE(body.length);
  chunks.push(bodyLength, body);
  return Buffer.concat(chunks);
}

function parseMessage(input) {
  const buffer = Buffer.from(input);
  const type = buffer[1] >> 4;
  const flag = buffer[1] & 0x0f;
  let offset = 4;
  if (type === MsgType.Error) {
    const errorCode = buffer.readUInt32BE(offset); offset += 4;
    const size = buffer.readUInt32BE(offset); offset += 4;
    return { type, flag, errorCode, payload: buffer.subarray(offset, offset + size) };
  }
  if ([MsgType.FullServerResponse, MsgType.AudioOnlyServer].includes(type) && [Flag.PositiveSeq, Flag.NegativeSeq].includes(flag)) offset += 4;
  let event = 0;
  if (flag === Flag.WithEvent) {
    event = buffer.readInt32BE(offset); offset += 4;
    const connectionEvent = [Event.ConnectionStarted, Event.ConnectionFailed, Event.FinishConnection].includes(event);
    if (!connectionEvent) {
      const size = buffer.readUInt32BE(offset); offset += 4 + size;
    }
    if ([Event.ConnectionStarted, Event.ConnectionFailed].includes(event)) {
      const size = buffer.readUInt32BE(offset); offset += 4 + size;
    }
  }
  const size = buffer.readUInt32BE(offset); offset += 4;
  return { type, flag, event, payload: buffer.subarray(offset, offset + size) };
}

function pcmToWav(pcm, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function synthesisRequest(target, speaker) {
  return {
    req_params: {
      speaker,
      audio_params: { format: "pcm", sample_rate: 24000, speech_rate: 0, loudness_rate: 0, enable_subtitle: false },
      additions: { disable_markdown_filter: true, explicit_language: "zh-cn" },
      context_texts: [target.voiceDirection],
    },
  };
}

function synthesize(target, speaker, options) {
  return new Promise((resolve, reject) => {
    const connectId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const chunks = [];
    let done = false;
    const socket = new WebSocket(endpoint, { headers: { "X-Api-Key": options.apiKey, "X-Api-Resource-Id": options.resourceId, "X-Api-Connect-Id": connectId } });
    const finish = (error) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      try { socket.close(); } catch {}
      if (error) reject(error); else resolve(Buffer.concat(chunks));
    };
    const timeout = setTimeout(() => finish(new Error("Volcengine synthesis timed out.")), 45000);
    socket.on("open", () => socket.send(encodeMessage(Event.StartConnection, "", {})));
    socket.on("message", (raw) => {
      try {
        const message = parseMessage(raw);
        if (message.type === MsgType.Error || message.event === Event.ConnectionFailed || message.event === Event.SessionFailed) {
          return finish(new Error(`Volcengine synthesis failed (${message.errorCode || message.event}).`));
        }
        if (message.type === MsgType.AudioOnlyServer && message.payload.length) chunks.push(message.payload);
        if (message.event === Event.ConnectionStarted) socket.send(encodeMessage(Event.StartSession, sessionId, synthesisRequest(target, speaker)));
        if (message.event === Event.SessionStarted) {
          socket.send(encodeMessage(Event.TaskRequest, sessionId, { text: target.spokenText }));
          socket.send(encodeMessage(Event.FinishSession, sessionId, {}));
        }
        if (message.event === Event.SessionFinished) {
          socket.send(encodeMessage(Event.FinishConnection, "", {}));
          if (chunks.length) finish(); else finish(new Error("Volcengine synthesis returned no audio."));
        }
      } catch (error) { finish(error); }
    });
    socket.on("error", (error) => finish(new Error(`Volcengine WebSocket failure: ${error.message}`)));
    socket.on("close", () => { if (!done) finish(chunks.length ? null : new Error("Volcengine closed before audio arrived.")); });
  });
}

function refreshRuntime() {
  const result = childProcess.spawnSync(process.execPath, ["scripts/refresh-voice-runtime.mjs"], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) throw new Error("refresh-voice-runtime.mjs failed.");
}

async function main() {
  const options = config();
  const defaultSpeaker = process.env.VOLC_TTS_DEFAULT_SPEAKER || "";
  if (probe) {
    if (!defaultSpeaker) throw new Error("VOLC_TTS_DEFAULT_SPEAKER is required for --probe.");
    const audio = await synthesize({ spokenText: "语音连接测试。", voiceDirection: "平静、自然，不朗读说明文字。" }, defaultSpeaker, options);
    console.log(`Volcengine probe passed: pcmBytes=${audio.length}`);
    return;
  }
  const targets = targetsFor(loadData()).filter((target) => !requestedIds.size || requestedIds.has(target.id));
  const speakerMap = readSpeakerMap([...new Set(targets.map((target) => target.roleId))]);
  const files = audioPaths();
  const manifest = readManifest(files.manifest);
  manifest.version = 3;
  manifest.provider = "volcengine-doubao-tts-websocket";
  manifest.storyId = story.id;
  fs.mkdirSync(files.original, { recursive: true });
  let generated = 0;
  let skipped = 0;
  for (const target of targets) {
    const speaker = speakerMap[target.roleId];
    const textHash = hash(target.spokenText);
    const configHash = hash(JSON.stringify({ provider: manifest.provider, resourceId: options.resourceId, speaker, direction: target.voiceDirection }));
    const filename = `${story.prefix}_${target.id}__${target.roleId}.wav`;
    const output = path.join(files.original, filename);
    const previous = manifest.entries?.[target.id];
    if (!force && previous?.provider === manifest.provider && previous.textHash === textHash && previous.configHash === configHash && fs.existsSync(output)) {
      skipped += 1;
      continue;
    }
    const pcm = await synthesize(target, speaker, options);
    fs.writeFileSync(output, pcmToWav(pcm));
    manifest.entries[target.id] = {
      id: target.id, kind: "node", nodeId: target.nodeId, chapterId: target.chapterId, speaker: target.speaker, roleId: target.roleId,
      contentType: target.contentType, voiceDirection: target.voiceDirection, fileName: filename, webPath: `${story.audioRoot}/voice-original/${filename}`,
      provider: manifest.provider, resourceId: options.resourceId, speaker, sampleRate: 24000, channels: 1, bitDepth: 16,
      characterCount: [...target.spokenText].length, textHash, configHash, generatedAt: new Date().toISOString(), status: "generated",
    };
    saveManifest(files.manifest, manifest);
    generated += 1;
    await wait(120);
  }
  saveManifest(files.manifest, manifest);
  refreshRuntime();
  console.log(`Volcengine voice generation complete: story=${story.id}; generated=${generated}; skipped=${skipped}; targets=${targets.length}`);
}

main().catch((error) => {
  console.error(`Volcengine voice generation stopped: ${error.message}`);
  process.exit(1);
});
