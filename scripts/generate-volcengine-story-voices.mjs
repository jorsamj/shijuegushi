import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import WebSocket from "ws";

const root = path.resolve(import.meta.dirname, "..");
const endpoint = "wss://openspeech.bytedance.com/api/v3/tts/bidirection";
const storyName = process.argv.find((argument) => argument.startsWith("--story="))?.slice(8) || "dormitory";
const stage = process.argv.includes("--stage");
const force = process.argv.includes("--force");
const requestedIds = new Set((process.argv.find((argument) => argument.startsWith("--ids="))?.slice(6) || "").split(",").filter(Boolean));
const stories = {
  dormitory: {
    id: "script_dormitory_rollcall",
    file: "assets/stories/dormitory-rollcall/story-data.js",
    global: "MIST_DORMITORY_DATA",
    prefix: "dorm",
    audioRoot: "assets/stories/dormitory-rollcall/audio",
  },
  "rain-call": {
    id: "script_rain_call",
    file: "story-data.js",
    global: "MIST_DATA",
    prefix: "rain",
    audioRoot: "assets/stories/rain-call/audio",
  },
};
const story = stories[storyName];
const audibleTypes = new Set(["dialogue", "broadcast", "phone", "recording", "inner-monologue"]);
const provider = "volcengine-doubao-tts-websocket";
const model = "seed-tts-2.0";
const debugEvents = process.env.VOLC_TTS_DEBUG_EVENTS === "1";

if (!story) throw new Error("Use --story=dormitory or --story=rain-call.");
if (!stage) throw new Error("Formal generation must use --stage before promotion.");

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function loadScript(file, globalName) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  return context.window[globalName];
}

function loadCasting() {
  return loadScript("assets/voice-casting-manifest.js", "SECOND_LIFE_VOICE_CASTING");
}

function loadVerifiedVoiceTypes() {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets/volcengine-tts2-voice-catalog.json"), "utf8"));
  return new Set((catalog.voices || [])
    .filter((voice) => voice.modelStatus === "verified" && voice.model === "Doubao Voice Synthesis Model 2.0")
    .map((voice) => voice.voiceType));
}

function normaliseForSpeech(text) {
  return String(text || "")
    .replace(/[\u201c\u201d"]/g, "")
    .replace(/00:17/g, "\u96f6\u70b9\u5341\u4e03\u5206")
    .replace(/00:44/g, "\u96f6\u70b9\u56db\u5341\u56db\u5206")
    .replace(/01:13/g, "\u4e00\u70b9\u5341\u4e09\u5206")
    .replace(/2014/g, "\u4e8c\u96f6\u4e00\u56db\u5e74")
    .replace(/417/g, "\u56db\u4e00\u4e03")
    .replace(/\s+/g, " ")
    .trim();
}

function currentStoryCasting() {
  const casting = loadCasting();
  if (casting?.provider !== provider || casting?.model !== model) throw new Error("Formal Volcengine casting manifest is not configured for Model 2.0.");
  const storyCasting = casting.stories?.[story.id];
  if (!storyCasting) throw new Error(`No formal casting exists for ${story.id}.`);
  return storyCasting;
}

function targetFromNode(node, storyCasting, verifiedVoiceTypes) {
  const roleId = storyCasting.speakerAliases?.[node.speaker];
  const role = storyCasting.roles?.[roleId];
  if (!role) throw new Error(`No formal Model 2.0 casting exists for ${node.nodeId} (${node.speaker}).`);
  if (!verifiedVoiceTypes.has(role.voiceType) || !role.voiceType.endsWith("_uranus_bigtts")) {
    throw new Error(`Casting for ${roleId} is not a verified Model 2.0 uranus_bigtts voice.`);
  }
  return {
    id: node.nodeId,
    kind: "node",
    nodeId: node.nodeId,
    chapterId: node.chapterId,
    nodeIds: [node.nodeId],
    speaker: node.speaker,
    roleId,
    role,
    contentType: node.contentType,
    displayText: node.text,
    spokenText: normaliseForSpeech(node.spokenText),
    voiceDirection: node.voiceDirection || "Natural present-tense dialogue. Do not narrate stage directions.",
  };
}

function targetsFor(data, storyCasting, verifiedVoiceTypes) {
  return Object.values(data.nodes || {})
    .filter((node) => audibleTypes.has(node.contentType) && node.voiceEnabled === true && node.spokenText)
    .map((node) => targetFromNode(node, storyCasting, verifiedVoiceTypes));
}

function dormitoryBroadcastTargets(storyCasting, verifiedVoiceTypes) {
  if (storyName !== "dormitory") return [];
  const contract = loadScript("assets/stories/dormitory-rollcall/broadcast-audio-contract.js", "DORMITORY_BROADCAST_AUDIO_CONTRACT");
  const role = storyCasting.roles?.dorm_broadcast;
  if (!role || !verifiedVoiceTypes.has(role.voiceType) || !role.voiceType.endsWith("_uranus_bigtts")) {
    throw new Error("Dormitory broadcast does not have a verified Model 2.0 casting.");
  }
  return (contract?.cues || []).map((cue) => ({
    id: cue.audioId,
    kind: "broadcast-cue",
    nodeId: cue.nodeIds?.[0],
    nodeIds: cue.nodeIds || [],
    chapterId: (cue.chapterIds || []).join(","),
    speaker: "\u5e7f\u64ad",
    roleId: "dorm_broadcast",
    role,
    contentType: "broadcast",
    displayText: cue.line,
    spokenText: normaliseForSpeech(cue.line),
    voiceDirection: cue.tone || "Calm institutional dormitory PA broadcast.",
  }));
}

function stagingPaths() {
  const base = path.join(root, story.audioRoot);
  return {
    original: path.join(base, "voice-staging"),
    manifest: path.join(base, "voice-staging-manifest.json"),
    webRoot: `${story.audioRoot}/voice-staging`,
  };
}

function readManifest(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { version: 4, provider, model, storyId: story.id, entries: {} };
  }
}

function writeJsonAtomically(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, file);
}

function config() {
  const apiKey = process.env.VOLC_TTS_API_KEY || "";
  const resourceId = process.env.VOLC_TTS_RESOURCE_ID || "";
  if (!apiKey) throw new Error("VOLC_TTS_API_KEY is required. No fallback provider will be used.");
  if (!resourceId) throw new Error("VOLC_TTS_RESOURCE_ID is required for the formal Model 2.0 delivery.");
  return { apiKey, resourceId };
}

const MsgType = { FullClientRequest: 1, FullServerResponse: 9, AudioOnlyServer: 11, Error: 15 };
const Flag = { NoSeq: 0, PositiveSeq: 1, NegativeSeq: 3, WithEvent: 4 };
const Event = { StartConnection: 1, FinishConnection: 2, ConnectionStarted: 50, ConnectionFailed: 51, StartSession: 100, FinishSession: 102, SessionStarted: 150, SessionFinished: 152, SessionFailed: 153, TaskRequest: 200 };

function jsonPayload(value) { return Buffer.from(JSON.stringify(value), "utf8"); }

function encodeMessage(event, sessionId, payload = {}) {
  const isConnectionEvent = [Event.StartConnection, Event.FinishConnection].includes(event);
  const chunks = [Buffer.from([0x11, (MsgType.FullClientRequest << 4) | Flag.WithEvent, 0x10, 0]), Buffer.alloc(4)];
  chunks[1].writeInt32BE(event);
  if (!isConnectionEvent) {
    const session = Buffer.from(sessionId, "utf8");
    const length = Buffer.alloc(4);
    length.writeUInt32BE(session.length);
    chunks.push(length, session);
  }
  const body = jsonPayload(payload);
  const bodyLength = Buffer.alloc(4);
  bodyLength.writeUInt32BE(body.length);
  chunks.push(bodyLength, body);
  return Buffer.concat(chunks);
}

function parseMessage(input) {
  const buffer = Buffer.from(input);
  const type = buffer[1] >> 4;
  const flag = buffer[1] & 0x0f;
  let offset = 4;
  if (type === MsgType.Error) {
    const errorCode = buffer.readUInt32BE(offset);
    offset += 4;
    const size = buffer.readUInt32BE(offset);
    offset += 4;
    return { type, flag, errorCode, payload: buffer.subarray(offset, offset + size) };
  }
  if ([MsgType.FullServerResponse, MsgType.AudioOnlyServer].includes(type) && [Flag.PositiveSeq, Flag.NegativeSeq].includes(flag)) offset += 4;
  let event = 0;
  if (flag === Flag.WithEvent) {
    event = buffer.readInt32BE(offset);
    offset += 4;
    const connectionEvent = [Event.ConnectionStarted, Event.ConnectionFailed, Event.FinishConnection].includes(event);
    if (!connectionEvent) {
      const size = buffer.readUInt32BE(offset);
      offset += 4 + size;
    }
    if ([Event.ConnectionStarted, Event.ConnectionFailed].includes(event)) {
      const size = buffer.readUInt32BE(offset);
      offset += 4 + size;
    }
  }
  const size = buffer.readUInt32BE(offset);
  offset += 4;
  return { type, flag, event, payload: buffer.subarray(offset, offset + size) };
}

function safeServerDetail(message) {
  const raw = message?.payload?.toString("utf8")?.trim();
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    const code = parsed.code || parsed.error_code || parsed.err_code || "";
    const serverMessage = parsed.message || parsed.error || parsed.err_msg || parsed.msg || "";
    return [code, serverMessage].filter(Boolean).join(": ");
  } catch {
    return raw.replace(/\s+/g, " ").slice(0, 240);
  }
}

function pcmToWav(pcm, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function synthesisRequest(target, options) {
  return {
    req_params: {
      speaker: target.role.voiceType,
      text: target.spokenText,
      audio_params: { format: "pcm", sample_rate: 24000, speech_rate: 0, loudness_rate: 0, enable_subtitle: false },
      additions: JSON.stringify({ disable_markdown_filter: true, explicit_language: "zh-cn" }),
      context_texts: [target.role.contextProfile, target.role.sourceProfile, target.voiceDirection],
    },
  };
}

function startSessionRequest() {
  return {};
}

function synthesize(target, options) {
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
        if (debugEvents) {
          console.error(`Volcengine event: type=${message.type}; flag=${message.flag}; event=${message.event || 0}; bytes=${message.payload?.length || 0}`);
          if (message.event === 350 && message.payload?.length) {
            console.error(`Volcengine event 350 payload: ${message.payload.toString("utf8").replace(/\s+/g, " ").slice(0, 240)}`);
          }
        }
        if (message.type === MsgType.Error || message.event === Event.ConnectionFailed || message.event === Event.SessionFailed) {
          const detail = safeServerDetail(message);
          return finish(new Error(`Volcengine synthesis failed (${message.errorCode || message.event})${detail ? `: ${detail}` : ""}.`));
        }
        if (message.type === MsgType.AudioOnlyServer && message.payload.length) chunks.push(message.payload);
        if (message.event === Event.ConnectionStarted) socket.send(encodeMessage(Event.StartSession, sessionId, startSessionRequest()));
        if (message.event === Event.SessionStarted) {
          socket.send(encodeMessage(Event.TaskRequest, sessionId, synthesisRequest(target, options)));
          socket.send(encodeMessage(Event.FinishSession, sessionId, {}));
        }
        if (message.event === Event.SessionFinished) {
          socket.send(encodeMessage(Event.FinishConnection, "", {}));
          if (chunks.length) finish(); else finish(new Error("Volcengine synthesis returned no audio."));
        }
      } catch (error) {
        finish(error);
      }
    });
    socket.on("error", (error) => finish(new Error(`Volcengine WebSocket failure: ${error.message}`)));
    socket.on("close", () => { if (!done) finish(chunks.length ? null : new Error("Volcengine closed before audio arrived.")); });
  });
}

async function main() {
  const options = config();
  const storyCasting = currentStoryCasting();
  const verifiedVoiceTypes = loadVerifiedVoiceTypes();
  const data = loadScript(story.file, story.global);
  const targets = [...targetsFor(data, storyCasting, verifiedVoiceTypes), ...dormitoryBroadcastTargets(storyCasting, verifiedVoiceTypes)]
    .filter((target) => !requestedIds.size || requestedIds.has(target.id));
  const files = stagingPaths();
  const manifest = readManifest(files.manifest);
  manifest.version = 4;
  manifest.provider = provider;
  manifest.model = model;
  manifest.storyId = story.id;
  manifest.entries ||= {};
  fs.mkdirSync(files.original, { recursive: true });

  let generated = 0;
  let skipped = 0;
  for (const target of targets) {
    const textHash = hash(target.spokenText);
    const configHash = hash(JSON.stringify({ provider, model, resourceId: options.resourceId, voiceType: target.role.voiceType, sourceProfile: target.role.sourceProfile, contextProfile: target.role.contextProfile, direction: target.voiceDirection }));
    const filename = `${story.prefix}_${target.id}__${target.roleId}.wav`;
    const output = path.join(files.original, filename);
    const previous = manifest.entries[target.id];
    if (!force && previous?.provider === provider && previous?.model === model && previous?.voiceType === target.role.voiceType && previous?.textHash === textHash && previous?.configHash === configHash && fs.existsSync(output)) {
      skipped += 1;
      continue;
    }
    const pcm = await synthesize(target, options);
    fs.writeFileSync(output, pcmToWav(pcm));
    manifest.entries[target.id] = {
      id: target.id,
      kind: target.kind,
      nodeId: target.nodeId,
      nodeIds: target.nodeIds,
      chapterId: target.chapterId,
      speaker: target.speaker,
      roleId: target.roleId,
      contentType: target.contentType,
      voiceDirection: target.voiceDirection,
      sourceProfile: target.role.sourceProfile,
      fileName: filename,
      webPath: `${files.webRoot}/${filename}`,
      provider,
      model,
      voiceType: target.role.voiceType,
      resourceId: options.resourceId,
      sampleRate: 24000,
      channels: 1,
      bitDepth: 16,
      characterCount: [...target.spokenText].length,
      textHash,
      configHash,
      generatedAt: new Date().toISOString(),
      status: "generated",
    };
    writeJsonAtomically(files.manifest, manifest);
    generated += 1;
    await wait(120);
  }
  writeJsonAtomically(files.manifest, manifest);
  console.log(`Volcengine staging generation complete: story=${story.id}; generated=${generated}; skipped=${skipped}; targets=${targets.length}`);
}

main().catch((error) => {
  console.error(`Volcengine staging generation stopped: ${error.message}`);
  process.exit(1);
});
