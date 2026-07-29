import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(root, "assets/stories/dormitory-namefloor/formal/visual-manifest.js");
const expectedCharacters = ["linfeng", "zhouchaoyang", "guyu", "songming", "manager_wu", "green_vest", "red_vest"];
const expectedBackgrounds = ["dorm_1107_midnight", "corridor_11f", "manager_room", "floor4_corridor", "principal_office"];
const bannedLegacy = /(?:xutang|linsui|zhaoqing|chenlu|shenyan|zhouwanning|dormitory-rollcall)/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadManifest() {
  assert(fs.existsSync(manifestPath), "phase-1 formal visual manifest is missing");
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
    const data = bytes.subarray(cursor + 8, cursor + 8 + length);
    if (type === "IDAT") chunks.push(data);
    cursor += length + 12;
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24],
    colorType: bytes[25],
    interlace: bytes[28],
    idat: Buffer.concat(chunks),
  };
}

function hasRealAlpha(png) {
  if (png.colorType !== 6 || png.bitDepth !== 8 || png.interlace !== 0) return false;
  const bytesPerPixel = 4;
  const scanline = png.width * bytesPerPixel;
  const inflated = zlib.inflateSync(png.idat);
  let cursor = 0;
  let prior = Buffer.alloc(scanline);
  for (let y = 0; y < png.height; y += 1) {
    const filter = inflated[cursor++];
    const row = Buffer.from(inflated.subarray(cursor, cursor + scanline));
    cursor += scanline;
    for (let x = 0; x < row.length; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const above = prior[x];
      const upperLeft = x >= bytesPerPixel ? prior[x - bytesPerPixel] : 0;
      if (filter === 1) row[x] = (row[x] + left) & 255;
      if (filter === 2) row[x] = (row[x] + above) & 255;
      if (filter === 3) row[x] = (row[x] + Math.floor((left + above) / 2)) & 255;
      if (filter === 4) {
        const p = left + above - upperLeft;
        const pa = Math.abs(p - left), pb = Math.abs(p - above), pc = Math.abs(p - upperLeft);
        row[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? above : upperLeft)) & 255;
      }
    }
    for (let x = 3; x < row.length; x += bytesPerPixel) if (row[x] < 255) return true;
    prior = row;
  }
  return false;
}

const manifest = loadManifest();
assert(["phase-1", "phase-2", "phase-3", "phase-4"].includes(manifest?.phase), "manifest must identify an approved formal visual checkpoint");
assert(manifest?.generation?.model === "gpt-image-2", "phase-1 generation record must be gpt-image-2");
assert(!JSON.stringify(manifest).match(/(?:api[_-]?key|authorization|bearer\s+)/i), "manifest must not include credentials");
const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
const phase1Assets = assets.filter((asset) => asset.phase !== "state-approved");
assert(phase1Assets.length === 13, `phase-1 must retain exactly 13 approved checkpoint assets, received ${phase1Assets.length}`);

for (const asset of phase1Assets) {
  assert(asset.phase === "master-approved" || asset.phase === "background-approved" || asset.phase === "ending-approved", `invalid phase status: ${asset.id}`);
  assert(asset.runtimeIntegrated === false, `phase-1 asset must not be runtime integrated: ${asset.id}`);
  assert(asset.path.startsWith("assets/stories/dormitory-namefloor/formal/"), `asset outside formal namespace: ${asset.id}`);
  assert(!bannedLegacy.test(`${asset.id} ${asset.path} ${asset.descriptionZh}`), `legacy reference in asset: ${asset.id}`);
  const absolute = path.join(root, asset.path);
  assert(fs.existsSync(absolute), `missing registered asset: ${asset.path}`);
  const bytes = fs.readFileSync(absolute);
  assert(bytes.length > 0, `empty registered asset: ${asset.path}`);
  const png = decodePng(bytes);
  assert(png.width === asset.width && png.height === asset.height, `dimension mismatch: ${asset.id}`);
  if (asset.assetType === "character-master") {
    assert(png.colorType === 6 && asset.transparent === true, `character master needs real RGBA source: ${asset.id}`);
    assert(hasRealAlpha(png), `character master needs non-opaque alpha pixels: ${asset.id}`);
  } else {
    assert(asset.transparent === false, `non-character asset transparency mismatch: ${asset.id}`);
  }
}

const characterAssets = phase1Assets.filter((asset) => asset.assetType === "character-master");
assert(characterAssets.length === 7, "phase-1 needs seven character masters");
assert(expectedCharacters.every((characterId) => characterAssets.some((asset) => asset.characterId === characterId)), "missing phase-1 character master");
assert(characterAssets.find((asset) => asset.characterId === "guyu")?.gender === "male", "Gu Yu must be registered as male");
const backgrounds = phase1Assets.filter((asset) => asset.assetType === "background");
assert(backgrounds.length === 5, "phase-1 needs five reusable backgrounds");
assert(expectedBackgrounds.every((sceneId) => backgrounds.some((asset) => asset.sceneId === sceneId)), "missing phase-1 background");
const ending = phase1Assets.filter((asset) => asset.assetType === "ending-key-art");
assert(ending.length === 1 && ending[0].endingId === "E1", "phase-1 needs only E1 key art");

console.log("phase-1 formal visuals OK: 7 character masters, 5 backgrounds, E1 key art");
