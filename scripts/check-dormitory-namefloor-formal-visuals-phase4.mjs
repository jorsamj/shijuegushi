import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(root, "assets/stories/dormitory-namefloor/formal/visual-manifest.js");
const masterId = "char_guyu_master_upper_neutral";
const stateIds = ["timid_alert", "panicked", "trusting_linfeng", "memory_blurred", "sacrifice_resolve", "name_disappearing"];
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

function decode(bytes) {
  assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "not a PNG");
  assert(bytes.subarray(12, 16).toString("ascii") === "IHDR", "PNG is missing IHDR");
  const chunks = [];
  for (let cursor = 8; cursor < bytes.length;) {
    const length = bytes.readUInt32BE(cursor);
    if (bytes.subarray(cursor + 4, cursor + 8).toString("ascii") === "IDAT") chunks.push(bytes.subarray(cursor + 8, cursor + 8 + length));
    cursor += length + 12;
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), bitDepth: bytes[24], colorType: bytes[25], interlace: bytes[28], idat: Buffer.concat(chunks) };
}

function hasRealAlpha(png) {
  if (png.colorType !== 6 || png.bitDepth !== 8 || png.interlace !== 0) return false;
  const stride = png.width * 4;
  const inflated = zlib.inflateSync(png.idat);
  let cursor = 0;
  let previous = Buffer.alloc(stride);
  for (let y = 0; y < png.height; y += 1) {
    const filter = inflated[cursor++];
    const row = Buffer.from(inflated.subarray(cursor, cursor + stride));
    cursor += stride;
    for (let x = 0; x < row.length; x += 1) {
      const left = x >= 4 ? row[x - 4] : 0;
      const above = previous[x];
      const upperLeft = x >= 4 ? previous[x - 4] : 0;
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
    previous = row;
  }
  return false;
}

const visualManifest = loadManifest();
const assets = Array.isArray(visualManifest?.assets) ? visualManifest.assets : [];
assert(!banned.test(JSON.stringify(visualManifest)), "manifest contains a legacy reference or credential-like content");
const master = assets.find((asset) => asset.id === masterId);
assert(master?.assetType === "character-master" && master.characterId === "guyu" && master.gender === "male", "Gu Yu master metadata is invalid");
assert(typeof master.path === "string" && fs.existsSync(path.join(root, master.path)), "Gu Yu master file is missing");

for (const stateId of stateIds) {
  const asset = assets.find((entry) => entry.assetType === "character-state" && entry.characterId === "guyu" && entry.stateId === stateId);
  assert(asset, `Gu Yu state is not registered: ${stateId}`);
  assert(asset.gender === "male", `Gu Yu state must be registered as male: ${stateId}`);
  assert(typeof asset.path === "string" && asset.path.trim().length > 0, `Gu Yu state path is empty: ${stateId}`);
  assert(asset.sourceMaster === master.path, `Gu Yu state must use the registered master: ${stateId}`);
  assert(asset.model === "gpt-image-2", `Gu Yu state must record gpt-image-2: ${stateId}`);
  assert(asset.width === 1024 && asset.height === 1536 && asset.alpha === true, `Gu Yu state metadata is invalid: ${stateId}`);
  assert(asset.batchStatus === "complete", `Gu Yu state batch is incomplete: ${stateId}`);
  assert(asset.runtimeIntegrated === false, `Gu Yu state cannot be runtime integrated in phase 4: ${stateId}`);
  const absolute = path.join(root, asset.path);
  assert(fs.existsSync(absolute) && fs.statSync(absolute).size > 0, `Gu Yu state is missing or empty: ${stateId}`);
  const png = decode(fs.readFileSync(absolute));
  assert(png.width === 1024 && png.height === 1536 && hasRealAlpha(png), `Gu Yu state needs 1024x1536 real alpha PNG: ${stateId}`);
}

console.log("phase-4 formal visuals OK: 6 approved Gu Yu state images");
