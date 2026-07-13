import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import WebSocket from "ws";

const root = path.resolve(import.meta.dirname, "..");
const DEFAULT_ENDPOINT = "wss://cbm01.cn-huabei-1.xf-yun.com/v1/private/mcd9m97e6";
const storyName = process.argv.find((arg) => arg.startsWith("--story="))?.slice(8) || "dormitory";
const mode = process.argv.includes("--probe-all") ? "probe-all" : process.argv.includes("--probe") ? "probe" : process.argv.includes("--audit") ? "audit" : "generate";
const probeVcn = process.argv.find((arg) => arg.startsWith("--probe-vcn="))?.slice(12) || "";
const force = process.argv.includes("--force");
const RETRIES = 3;
const GAP_MS = 650;

const stories = {
  dormitory: { id: "script_dormitory_rollcall", file: "assets/stories/dormitory-rollcall/story-data.js", global: "MIST_DORMITORY_DATA", prefix: "dorm", audioRoot: "assets/stories/dormitory-rollcall/audio" },
  "rain-call": { id: "script_rain_call", file: "story-data.js", global: "MIST_DATA", prefix: "rain", audioRoot: "assets/stories/rain-call/audio" },
};
const story = stories[storyName];
if (!story) throw new Error("Use --story=dormitory or --story=rain-call.");

// Candidate order follows the official current Mandarin speaker list. The probe
// keeps only one authorised, globally unique vcn per story role.
const roles = {
  Narrator: { roleId: "narrator", label: "旁白", candidates: ["x6_pangbainv1_pro", "x6_pangbainan1_pro", "x6_lingfeihan_pro", "x6_gufengpangbai_pro", "x6_lingxiaoyun_pro", "x5_lingxiaoyue_flow"], speed: 45, pitch: 47, volume: 48 },
  Broadcast: { roleId: "dorm_broadcast", label: "宿舍广播", candidates: ["x6_zhuanyenvzhuchi_pro", "x6_lingyufei_pro", "x6_lingxiaoshan_pro"], speed: 43, pitch: 48, volume: 48 },
  广播: { aliasOf: "Broadcast" },
  陈露: { roleId: "chenlu", label: "陈露", candidates: ["x6_lingxiaoxue_pro", "x6_lingxiaoyue_pro", "x6_lingxiaoli_pro"], speed: 54, pitch: 54, volume: 50 },
  "Chen Lu": { aliasOf: "陈露" },
  沈妍: { roleId: "shenyan", label: "沈妍", candidates: ["x6_lingxiaoli_pro", "x6_lingyuyan_pro", "x5_lingxiaoxuan_flow"], speed: 44, pitch: 49, volume: 47 },
  "Shen Yan": { aliasOf: "沈妍" },
  吴阿姨: { roleId: "manager_wu", label: "吴阿姨", candidates: ["x6_lingxiaoshan_pro", "x5_lingyuzhao_flow", "x6_huifangnv_pro"], speed: 46, pitch: 43, volume: 50 },
  周婉宁: { roleId: "zhouwanning", label: "周婉宁", candidates: ["x6_lingxiaoyun_pro", "x6_ganliannvxing_pro", "x5_lingxiaoxuan_flow"], speed: 42, pitch: 48, volume: 46 },
  许棠: { roleId: "xutang", label: "许棠", candidates: ["x6_lingxiaoxuan_pro", "x6_lingxiaoyue_pro", "x5_lingyuyan_flow"], speed: 48, pitch: 55, volume: 50 },
  赵晴: { roleId: "zhaoqing", label: "赵晴", candidates: ["x6_ganliannvxing_pro", "x6_lingyufei_pro", "x6_lingxiaozhen_pro"], speed: 48, pitch: 46, volume: 50 },
  林穗: { roleId: "linsui", label: "林穗", candidates: ["x6_lingxiaoyue_pro", "x6_lingxiaoli_pro", "x6_lingxiaoyu_pro", "x6_lingxiaoluo_pro", "x5_lingxiaoyue_flow"], speed: 49, pitch: 52, volume: 50 },
  旁白: { aliasOf: "Narrator" },
  林舟: { roleId: "linzhou", label: "林舟", candidates: ["x6_lingxiaowan_pro", "x6_lingxiaoluo_pro", "x6_lingxiaoyu_pro"], speed: 47, pitch: 49, volume: 49 },
  许知晚: { roleId: "xuzhiwan", label: "许知晚", candidates: ["x6_lingxiaoxi_pro", "x6_lingxiaoshu_pro", "x6_lingxiaoyao_pro"], speed: 44, pitch: 45, volume: 48 },
  许知夏: { roleId: "xuzhixia", label: "许知夏", candidates: ["x6_tianjingshaonv_pro", "x6_lingfeiyue_pro", "x6_lingxiaoyu_pro"], speed: 44, pitch: 53, volume: 47 },
  "许知夏的声音": { aliasOf: "许知夏" },
  周屿: { roleId: "zhouyu", label: "周屿", candidates: ["x6_lingfeiyi_pro", "x6_lingfeiwen_pro", "x6_bokenansheng_pro"], speed: 44, pitch: 42, volume: 48 },
  陈妍: { roleId: "chenyan", label: "陈妍", candidates: ["x6_lingxiaoluo_pro", "x6_lingxiaowan_pro", "x6_lingxiaoxi_pro"], speed: 49, pitch: 50, volume: 50 },
  女人: { roleId: "woman_at_door", label: "门外女人", candidates: ["x6_lingxiaoshu_pro", "x6_lingxiaoyao_pro", "x6_wumeinv_pro"], speed: 43, pitch: 48, volume: 47 },
  房东老太: { roleId: "landlady", label: "房东老太", candidates: ["x6_huifangnv_pro", "x6_cuishounvsheng_pro", "x6_lingxiaoshan_pro"], speed: 44, pitch: 40, volume: 49 },
};

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function dataForStory() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, story.file), "utf8"), context, { filename: story.file });
  return context.window[story.global];
}
function dormitoryBroadcastContract() {
  if (storyName !== "dormitory") return [];
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/broadcast-audio-contract.js"), "utf8"), context, { filename: "broadcast-audio-contract.js" });
  return context.window.DORMITORY_BROADCAST_AUDIO_CONTRACT?.cues || [];
}
function speakerFor(name) {
  let speaker = String(name || "Narrator").trim(); const seen = new Set();
  while (roles[speaker]?.aliasOf && !seen.has(speaker)) { seen.add(speaker); speaker = roles[speaker].aliasOf; }
  return roles[speaker] ? speaker : "Narrator";
}
function spokenText(text) {
  return String(text || "").replace(/[“”]/g, "").replace(/00:17/g, "零点十七分").replace(/00:44/g, "零点四十四分").replace(/01:13/g, "一点十三分").replace(/2014/g, "二零一四年").replace(/417/g, "四一七").replace(/\s+/g, " ").trim();
}
function targetsFor(data) {
  const targets = Object.values(data.nodes || {}).filter((node) => node.text && node.type !== "choice").map((node) => {
    const speaker = speakerFor(node.speaker); const text = spokenText(node.text);
    return { id: node.nodeId, kind: "node", nodeId: node.nodeId, chapterId: node.chapterId, speaker, roleId: roles[speaker].roleId, displayText: node.text, spokenText: text, voiceDirection: roles[speaker].roleId === "dorm_broadcast" ? "official-broadcast" : /录音|录像|电话|广播/.test(text) ? "weak-recording" : /不要|快|立刻|倒计时/.test(text) ? "urgent" : speaker === "Narrator" ? "calm" : "restrained-fear" };
  }).filter((target) => target.spokenText);
  for (const ending of Object.values(data.endings || {})) {
    const text = spokenText(ending.text); if (text) targets.push({ id: ending.endingId, kind: "ending", endingId: ending.endingId, chapterId: "ending", speaker: "Narrator", roleId: "narrator", displayText: ending.text, spokenText: text, voiceDirection: "final-confirmation" });
  }
  for (const cue of dormitoryBroadcastContract()) {
    const text = spokenText(cue.line); if (!text) continue;
    targets.push({ id: `broadcast__${cue.audioId}`, kind: "broadcast-cue", cueId: cue.audioId, nodeId: cue.nodeIds?.[0] || null, chapterId: cue.chapterIds?.join(",") || "broadcast", speaker: "Broadcast", roleId: "dorm_broadcast", displayText: cue.line, spokenText: text, voiceDirection: "official-broadcast" });
  }
  return targets;
}
function auth() {
  const endpoint = process.env.XFYUN_TTS_ENDPOINT || DEFAULT_ENDPOINT;
  const appId = process.env.XFYUN_TTS_APP_ID || ""; const password = process.env.XFYUN_TTS_API_PASSWORD || "";
  const apiKey = process.env.XFYUN_TTS_API_KEY || ""; const apiSecret = process.env.XFYUN_TTS_API_SECRET || "";
  if (!appId || (!password && !(apiKey && apiSecret))) throw new Error("XFYUN credential environment variables are incomplete. No alternate provider will be used.");
  if (password) return { endpoint, appId, headers: { "x-api-key": password }, method: "api-password" };
  const url = new URL(endpoint); const date = new Date().toUTCString();
  const signature = crypto.createHmac("sha256", apiSecret).update(`host: ${url.host}\ndate: ${date}\nGET ${url.pathname} HTTP/1.1`).digest("base64");
  const authorization = Buffer.from(`api_key=\"${apiKey}\", algorithm=\"hmac-sha256\", headers=\"host date request-line\", signature=\"${signature}\"`).toString("base64");
  url.searchParams.set("host", url.host); url.searchParams.set("date", date); url.searchParams.set("authorization", authorization);
  return { endpoint: url.toString(), appId, headers: {}, method: "hmac" };
}
function synth(text, cast, config) {
  return new Promise((resolve, reject) => {
    let done = false; let sid = ""; const chunks = [];
    const socket = new WebSocket(config.endpoint, { headers: config.headers });
    const finish = (error) => { if (done) return; done = true; try { socket.close(); } catch {} error ? reject(error) : resolve({ audio: Buffer.concat(chunks), sid }); };
    socket.on("open", () => socket.send(JSON.stringify({ header: { app_id: config.appId, status: 2 }, parameter: { tts: { vcn: cast.vcn, speed: cast.speed, pitch: cast.pitch, volume: cast.volume, bgs: 0, reg: 0, rdn: 3, rhy: 0, audio: { encoding: "raw", sample_rate: 24000, channels: 1, bit_depth: 16, frame_size: 0 } } }, payload: { text: { encoding: "utf8", compress: "raw", format: "plain", status: 2, seq: 0, text: Buffer.from(text, "utf8").toString("base64") } } })));
    socket.on("message", (raw) => { try { const message = JSON.parse(raw.toString()); sid ||= message.header?.sid || ""; if (Number(message.header?.code || 0) !== 0) return finish(new Error(`XFYUN error ${message.header?.code}: ${message.header?.message || "unknown"}${Number(message.header?.code) === 10010 ? " (the vcn is not authorised)" : ""}`)); const frame = message.payload?.audio; if (frame?.audio) chunks.push(Buffer.from(frame.audio, "base64")); if (frame?.status === 2 || message.header?.status === 2) finish(); } catch { finish(new Error("XFYUN returned invalid JSON.")); } });
    socket.on("error", (error) => finish(new Error(`XFYUN WebSocket failure: ${error.message}`)));
    socket.on("close", () => { if (!done) finish(chunks.length ? null : new Error("XFYUN closed before audio arrived.")); });
  });
}
function toWav(pcm) { const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(24000, 24); h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40); return Buffer.concat([h, pcm]); }
function paths() { const audio = path.join(root, story.audioRoot); return { original: path.join(audio, "voice-original"), manifest: path.join(audio, "voice-manifest.json") }; }
function readManifest(file) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return { version: 1, provider: "xfyun-super-smart-tts-webapi", storyId: story.id, entries: {} }; } }
function saveManifest(file, manifest) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`); }
function readCastingRegistry() { try { const context = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, "assets", "voice-casting-manifest.js"), "utf8"), context, { filename: "voice-casting-manifest.js" }); const data = context.window.SECOND_LIFE_VOICE_CASTING || {}; if (data.stories) return data; return data.storyId ? { provider: data.provider, stories: { [data.storyId]: { roles: data.roles || {} } } } : { provider: "xfyun-super-smart-tts-webapi", stories: {} }; } catch { return { provider: "xfyun-super-smart-tts-webapi", stories: {} }; } }
function writeAudit(targets, manifest) { const rows = targets.map((target) => { const e = manifest.entries[target.id]; return `| ${story.id} | ${target.id} | ${target.chapterId} | ${target.speaker} | ${target.displayText.replace(/\|/g, "\\|")} | 是 | ${target.roleId} | ${e?.status || "missing"} | ${story.prefix}_${target.id}__${target.roleId}.wav | ${e?.status === "generated" ? "是" : "否"} | ${e?.textHash !== hash(target.spokenText) ? "是" : "否"} |`; }); const content = `# ${story.id} 配音审计\n\n| storyId | nodeId | chapterId | speaker | 显示文字 | 需要配音 | 角色 | 当前状态 | 计划文件名 | 已有音频 | 需要重生 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`; const individual = path.join(root, "docs", `VOICE_COVERAGE_AUDIT_${storyName}.md`); fs.writeFileSync(individual, content); const sections = Object.keys(stories).map((name) => { const file = path.join(root, "docs", `VOICE_COVERAGE_AUDIT_${name}.md`); return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : `# ${stories[name].id} 配音审计\n\n尚未生成审计。\n`; }); fs.writeFileSync(path.join(root, "docs", "VOICE_COVERAGE_AUDIT.md"), `# 剧情配音审计\n\n仅将正式旁白、角色对白、广播、录音、系统叙事、推理题干及结局正文计入覆盖。\n\n${sections.join("\n---\n\n")}`); }
function readRuntimeRegistry() { try { const context = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, "assets", "voice-runtime-manifest.js"), "utf8"), context, { filename: "voice-runtime-manifest.js" }); return context.window.SECOND_LIFE_VOICE_MANIFEST || { version: 1, stories: {} }; } catch { return { version: 1, stories: {} }; } }
function writeRuntime(manifest) { const runtime = readRuntimeRegistry(); runtime.stories ||= {}; runtime.stories[story.id] = { nodes: {}, endings: {}, cues: {} }; for (const entry of Object.values(manifest.entries)) { if (entry.status !== "generated") continue; const key = entry.kind === "ending" ? "endings" : entry.kind === "broadcast-cue" ? "cues" : "nodes"; runtime.stories[story.id][key][entry.cueId || entry.id] = { path: entry.webPath, roleId: entry.roleId, textHash: entry.textHash }; } fs.writeFileSync(path.join(root, "assets", "voice-runtime-manifest.js"), `(function () {\n  \"use strict\";\n  window.SECOND_LIFE_VOICE_MANIFEST = ${JSON.stringify(runtime, null, 2)};\n})();\n`); }
async function probe(candidates, used, config) { for (const vcn of candidates.filter((vcn) => !used.has(vcn))) { try { await synth("权限测试。", { vcn, speed: 50, pitch: 50, volume: 50 }, config); console.log(`authorised voice: ${vcn}`); return vcn; } catch (error) { console.log(`unavailable voice: ${vcn}; ${error.message}`); } await wait(GAP_MS); } return ""; }
async function main() {
  const targets = targetsFor(dataForStory()); const files = paths(); const manifest = readManifest(files.manifest); writeAudit(targets, manifest);
  const characterCount = targets.reduce((sum, target) => sum + [...target.spokenText].length, 0); console.log(`voice audit: story=${story.id}; targets=${targets.length}; characters=${characterCount}; existing=${Object.values(manifest.entries).filter((entry) => entry.status === "generated").length}`);
  if (mode === "audit") return;
  const config = auth(); console.log(`XFYUN authentication configured via ${config.method}; credentials are not logged.`);
  if (probeVcn) { await synth("权限测试。", { vcn: probeVcn, speed: 50, pitch: 50, volume: 50 }, config); console.log(`authorised voice: ${probeVcn}`); return; }
  const roleIds = [...new Set(targets.map((target) => target.roleId))]; const cast = {}; const registry = readCastingRegistry(); const ownCasting = registry.stories?.[story.id]?.roles || {}; const used = new Set(Object.entries(registry.stories || {}).filter(([storyId]) => storyId !== story.id).flatMap(([, entry]) => Object.values(entry.roles || {}).map((role) => role.vcn).filter(Boolean)));
  for (const roleId of roleIds) { const cached = ownCasting[roleId]; if (cached?.apiTestStatus === "authorised" && cached.vcn && !used.has(cached.vcn)) { cast[roleId] = cached; used.add(cached.vcn); } }
  const unavailableRoles = [];
  for (const roleId of roleIds) { if (cast[roleId]) continue; const profile = Object.values(roles).find((role) => role.roleId === roleId); const vcn = await probe(profile.candidates, used, config); if (!vcn) { unavailableRoles.push(profile.label); if (mode === "probe-all") continue; throw new Error(`No authorised unique vcn for ${profile.label}. Needed ${roleIds.length} distinct roles; formal batch generation has been stopped.`); } used.add(vcn); cast[roleId] = { ...profile, vcn, apiTestStatus: "authorised" }; }
  if (mode === "probe-all") { console.log(`voice probe complete: required=${roleIds.length}; authorised=${Object.keys(cast).length}; missing=${unavailableRoles.join(",") || "none"}`); if (unavailableRoles.length) process.exitCode = 2; return; }
  registry.stories ||= {}; registry.stories[story.id] = { roles: cast };
  fs.writeFileSync(path.join(root, "assets", "voice-casting-manifest.js"), `(function () { window.SECOND_LIFE_VOICE_CASTING = ${JSON.stringify({ provider: "xfyun-super-smart-tts-webapi", stories: registry.stories }, null, 2)}; })();\n`);
  fs.writeFileSync(path.join(root, "docs", "VOICE_CASTING.md"), `# 剧情配音选角\n\n提供商：科大讯飞超拟人语音合成 WebAPI。每个角色通过短文本探测后使用独立授权 vcn；不同故事的主要角色不复用音色。\n\n${Object.entries(registry.stories).map(([storyId, entry]) => `## ${storyId}\n\n${Object.values(entry.roles || {}).map((item) => `- ${item.label}: \`${item.vcn}\`，语速 ${item.speed}，语调 ${item.pitch}，音量 ${item.volume}。`).join("\n")}`).join("\n\n")}\n`);
  if (mode === "probe") return;
  fs.mkdirSync(files.original, { recursive: true }); let generated = 0; let skipped = 0; let failed = 0;
  for (const target of targets) { const voice = cast[target.roleId]; const textHash = hash(target.spokenText); const configHash = hash(JSON.stringify({ vcn: voice.vcn, speed: voice.speed, pitch: voice.pitch, volume: voice.volume, voiceDirection: target.voiceDirection })); const filename = `${story.prefix}_${target.id}__${target.roleId}.wav`; const targetPath = path.join(files.original, filename); const previous = manifest.entries[target.id];
    if (!force && previous?.status === "generated" && previous.textHash === textHash && previous.configHash === configHash && fs.existsSync(targetPath)) { skipped += 1; continue; }
    let lastError = ""; for (let attempt = 1; attempt <= RETRIES; attempt += 1) { try { const result = await synth(target.spokenText, voice, config); const wav = toWav(result.audio); fs.writeFileSync(targetPath, wav); manifest.entries[target.id] = { id: target.id, kind: target.kind, nodeId: target.nodeId || null, endingId: target.endingId || null, chapterId: target.chapterId, speaker: target.speaker, roleId: target.roleId, voiceDirection: target.voiceDirection, fileName: filename, webPath: `${story.audioRoot}/voice-original/${filename}`, provider: "xfyun-super-smart-tts-webapi", vcn: voice.vcn, sampleRate: 24000, channels: 1, bitDepth: 16, sid: result.sid, generatedAt: new Date().toISOString(), characterCount: [...target.spokenText].length, textHash, configHash, durationHintSeconds: Math.round((result.audio.length / 48000) * 10) / 10, status: "generated" }; saveManifest(files.manifest, manifest); generated += 1; lastError = ""; break; } catch (error) { lastError = error.message; if (attempt < RETRIES) await wait(900 * attempt); } }
    if (lastError) { manifest.entries[target.id] = { id: target.id, status: "failed", textHash, configHash, failure: lastError }; saveManifest(files.manifest, manifest); failed += 1; console.error(`failed ${target.id}: ${lastError}`); }
    await wait(GAP_MS);
  }
  writeRuntime(manifest); writeAudit(targets, manifest); console.log(`voice generation complete: generated=${generated}; skipped=${skipped}; failed=${failed}; characters=${characterCount}`); if (failed) process.exitCode = 1;
}
main().catch((error) => { console.error(`voice generation stopped: ${error.message}`); process.exit(1); });
