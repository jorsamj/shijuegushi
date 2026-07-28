import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(root, "assets/stories/dormitory-namefloor/formal/visual-manifest.js");
const masterId = "char_linfeng_master_upper_neutral";
const stateIds = [
  "phone_alert",
  "door_fear",
  "exhausted",
  "self_doubt",
  "name_eroding",
  "nameless_stage9",
];
const banned = /(?:xutang|linsui|zhaoqing|chenlu|shenyan|zhouwanning|dormitory-rollcall|api[_-]?key|authorization|bearer\s+)/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadManifest() {
  assert(fs.existsSync(manifestPath), "formal visual manifest is missing");
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(manifestPath, "utf8"), context, { filename: manifestPath });
  return context.window.DORMITORY_NAMEFLOOR_FORMAL_VISUALS;
}

function decodePng(bytes) {
  assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "not a PNG");
  assert(bytes.subarray(12, 16).toString("ascii") === "IHDR", "PNG is missing IHDR");
  const chunks = [];
  let cursor = 8;
  while (cursor < bytes.length) {
    const length = bytes.readUInt32BE(cursor);
    const type = bytes.subarray(cursor + 4, cursor + 8).toString("ascii");
    if (type === "IDAT") chunks.push(bytes.subarray(cursor + 8, cursor + 8 + length));
    cursor += length + 12;
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), bitDepth: bytes[24], colorType: bytes[25], interlace: bytes[28], idat: Buffer.concat(chunks) };
}

function hasRealAlpha(png) {
  if (png.colorType !== 6 || png.bitDepth !== 8 || png.interlace !== 0) return false;
  const stride = png.width * 4;
  const inflated = zlib.inflateSync(png.idat);
  let cursor = 0;
  let prior = Buffer.alloc(stride);
  for (let y = 0; y < png.height; y += 1) {
    const filter = inflated[cursor++];
    const row = Buffer.from(inflated.subarray(cursor, cursor + stride));
    cursor += stride;
    for (let x = 0; x < row.length; x += 1) {
      const left = x >= 4 ? row[x - 4] : 0;
      const above = prior[x];
      const upperLeft = x >= 4 ? prior[x - 4] : 0;
      if (filter === 1) row[x] = (row[x] + left) & 255;
      if (filter === 2) row[x] = (row[x] + above) & 255;
      if (filter === 3) row[x] = (row[x] + Math.floor((left + above) / 2)) & 255;
      if (filter === 4) {
        const p = left + above - upperLeft;
        const pa = Math.abs(p - left), pb = Math.abs(p - above), pc = Math.abs(p - upperLeft);
        row[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? above : upperLeft)) & 255;
      }
    }
    for (let x = 3; x < row.length; x += 4) if (row[x] < 255) return true;
    prior = row;
  }
  return false;
}

const manifest = loadManifest();
const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
assert(!banned.test(JSON.stringify(manifest)), "manifest contains a legacy reference or credential-like content");
const master = assets.find((asset) => asset.id === masterId);
assert(master, "Lin Feng master is not registered");
assert(master.characterId === "linfeng" && master.assetType === "character-master", "Lin Feng master metadata is invalid");
assert(master.path && fs.existsSync(path.join(root, master.path)), "Lin Feng master file is missing");

for (const stateId of stateIds) {
  const asset = assets.find((entry) => entry.assetType === "character-state" && entry.characterId === "linfeng" && entry.stateId === stateId);
  assert(asset, `Lin Feng state is not registered: ${stateId}`);
  assert(typeof asset.path === "string" && asset.path.trim().length > 0, `Lin Feng state path is empty: ${stateId}`);
  assert(asset.sourceMaster === master.path, `Lin Feng state must use the registered master: ${stateId}`);
  assert(asset.model === "gpt-image-2", `Lin Feng state must record gpt-image-2: ${stateId}`);
  assert(asset.width === 1024 && asset.height === 1536, `Lin Feng state metadata dimensions are invalid: ${stateId}`);
  assert(asset.alpha === true, `Lin Feng state must be registered as transparent: ${stateId}`);
  assert(asset.runtimeIntegrated === false, `Lin Feng state cannot be runtime integrated in phase 2: ${stateId}`);
  const absolute = path.join(root, asset.path);
  assert(fs.existsSync(absolute), `Lin Feng state file is missing: ${stateId}`);
  const bytes = fs.readFileSync(absolute);
  assert(bytes.length > 0, `Lin Feng state is empty: ${stateId}`);
  const png = decodePng(bytes);
  assert(png.width === 1024 && png.height === 1536, `Lin Feng state dimensions are invalid: ${stateId}`);
  assert(hasRealAlpha(png), `Lin Feng state needs real alpha: ${stateId}`);
}

console.log("phase-2 formal visuals OK: 6 approved Lin Feng state images");
