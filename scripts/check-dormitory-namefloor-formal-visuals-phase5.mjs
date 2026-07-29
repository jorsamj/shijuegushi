import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(root, "assets/stories/dormitory-namefloor/formal/visual-manifest.js");
const states = { door_pleading: "shared", suspected_injured: "shared", angry_defending: "real", real_betrayed: "real", mimic_calm: "mimic", mimic_uncanny: "mimic", mimic_self_aware: "mimic", mimic_sacrifice: "mimic" };
const source = "assets/stories/dormitory-namefloor/formal/characters/char_songming_master_upper_neutral.png";
const fail = (ok, message) => { if (!ok) throw new Error(message); };
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(manifestPath, "utf8"), ctx); const assets = ctx.window.DORMITORY_NAMEFLOOR_FORMAL_VISUALS.assets;
for (const [stateId, identityType] of Object.entries(states)) {
  const a = assets.find((x) => x.characterId === "songming" && x.stateId === stateId);
  fail(a && a.assetType === "character-state" && a.identityType === identityType && a.sourceMaster === source && a.model === "gpt-image-2" && a.width === 1024 && a.height === 1536 && a.alpha === true && a.runtimeIntegrated === false && a.batchStatus === "complete", `invalid Song Ming state metadata: ${stateId}`);
  const b = fs.readFileSync(path.join(root, a.path)); fail(b.length > 0 && b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && b.readUInt32BE(16) === 1024 && b.readUInt32BE(20) === 1536 && b[25] === 6, `invalid Song Ming PNG: ${stateId}`);
  const chunks=[]; for(let i=8;i<b.length;){const n=b.readUInt32BE(i);if(b.subarray(i+4,i+8).toString()==="IDAT")chunks.push(b.subarray(i+8,i+8+n));i+=n+12;} const raw=zlib.inflateSync(Buffer.concat(chunks)); fail(raw.some((v,i)=>i%4097===3&&v<255),`Song Ming alpha missing: ${stateId}`);
}
console.log("phase-5 formal visuals OK: 8 approved Song Ming real/mimic state images");
