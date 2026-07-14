import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const rawPath = resolve(root, "docs/official/volcengine-tts2/raw-official-content.txt");
const jsonPath = resolve(root, "assets/volcengine-tts2-voice-catalog.json");
const markdownPath = resolve(root, "docs/VOLCENGINE_TTS2_VOICE_CATALOG.md");
const sourceUrl = "https://docs.volcengine.com/docs/6561/1257544?lang=zh";

const scenes = ["通用场景", "角色扮演", "视频配音", "教育场景", "客服场景", "有声阅读", "多语种"];
const voiceLine = /^(?<prefix>.+?)\s+(?<voiceType>(?:zh|en)_(?:female|male)_[a-z0-9-]+_uranus_bigtts)\s*(?<tail>.*)$/;

function sourcePageFor(lineNumber) {
  return lineNumber < 136 ? 1 : 2;
}

function parseGender(voiceType) {
  if (voiceType.includes("_female_")) return "female";
  if (voiceType.includes("_male_")) return "male";
  return "unavailable";
}

function parseTail(tail) {
  const capabilityMarker = "指令遵循";
  const [languagePart, tagPart = ""] = tail.split(capabilityMarker);
  return {
    language: languagePart.replace(/^语种：/, "").trim() || "unavailable",
    capabilities: tail.includes(capabilityMarker) ? [capabilityMarker] : [],
    tags: tagPart.trim() || "unavailable",
  };
}

const raw = await readFile(rawPath, "utf8");
const sectionStart = raw.indexOf("===== PAGE 1 =====");
const sectionEnd = raw.indexOf("ICL_", sectionStart);

if (sectionStart === -1 || sectionEnd === -1) {
  throw new Error("Could not locate the official Model 2.0 standard-voice section in the saved evidence.");
}

const sectionLines = raw
  .slice(sectionStart, sectionEnd)
  .split(/\r?\n/)
  .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
;

const catalog = sectionLines
  .map(({ line, lineNumber }, index) => {
    const match = line.match(voiceLine);
    if (!match) return null;

    const scene = scenes.find((candidate) => match.groups.prefix.startsWith(candidate));
    if (!scene) return null;

    const displayName = match.groups.prefix.slice(scene.length).trim();
    if (!displayName) return null;

    const continuation = !match.groups.tail.includes("指令遵循") && sectionLines[index + 1]?.line.includes("指令遵循")
      ? ` ${sectionLines[index + 1].line}`
      : "";
    const metadata = parseTail(`${match.groups.tail}${continuation}`);
    const voiceType = match.groups.voiceType;
    const isChinese = voiceType.startsWith("zh_");

    return {
      officialDisplayName: displayName,
      voiceType,
      model: "Doubao Voice Synthesis Model 2.0",
      modelStatus: "verified",
      officialScene: scene,
      gender: parseGender(voiceType),
      genderStatus: "verified-from-official-voice-type",
      ageImpression: "unavailable",
      voiceCharacter: "unavailable",
      supportedLanguages: metadata.language,
      officialCapabilities: metadata.capabilities,
      officialTags: metadata.tags,
      emotion: {
        status: "unavailable",
        apiField: "unavailable",
        supportedValues: [],
        note: "The official Model 2.0 standard-voice table does not publish a fixed emotion enum or per-voice enum compatibility. The PDF's fixed emotion table is under the Model 1.0 heading and is intentionally excluded.",
      },
      emotionalControlParameters: "unavailable-in-this-official-voice-table",
      projectLanguageEligibility: isChinese ? "eligible-for-Chinese-casting-review" : "not-eligible-for-Chinese-story-casting",
      evidence: {
        sourceUrl,
        sourceFile: "docs/official/volcengine-tts2/raw-official-content.txt",
        extractedText: "docs/official/volcengine-tts2/raw-official-content.txt",
        page: sourcePageFor(lineNumber),
        rawLine: lineNumber,
        verificationStatus: "verified",
      },
    };
  })
  .filter(Boolean);

const uniqueVoiceTypes = new Set(catalog.map((entry) => entry.voiceType));
if (catalog.length !== uniqueVoiceTypes.size) throw new Error("Duplicate official Model 2.0 voice_type detected.");
if (catalog.some((entry) => entry.voiceType.includes("ICL_") || entry.voiceType.includes("_mars_"))) {
  throw new Error("The Model 2.0 standard catalog must not include ICL or Model 1.0 entries.");
}

const chineseVoiceCount = catalog.filter((entry) => entry.voiceType.startsWith("zh_")).length;
const data = {
  schemaVersion: 1,
  generatedFrom: "official-exported-pdf",
  retrievalDate: "2026-07-14",
  sourceUrl,
  sourcePdf: "owner-supplied official PDF export; not committed because the source page chrome may contain account identity",
  sourceUpdatedAt: "2026-07-13 10:25:43",
  scope: "Only standard voice_type rows explicitly under the official Doubao Voice Synthesis Model 2.0 heading. ICL, Model 1.0, and end-to-end S2S entries are excluded.",
  emotionPolicy: {
    status: "unavailable",
    note: "No Model 2.0 fixed emotion enum, field location, intensity range, or per-voice compatibility is supplied by the exported voice-list PDF. Do not pass an emotion field until a separate official API reference verifies it.",
  },
  summary: {
    verifiedVoiceCount: catalog.length,
    verifiedChineseVoiceCount: chineseVoiceCount,
    verifiedNonChineseVoiceCount: catalog.length - chineseVoiceCount,
  },
  voices: catalog,
};

const table = catalog
  .map((entry) => `| ${entry.officialDisplayName} | \`${entry.voiceType}\` | ${entry.officialScene} | ${entry.supportedLanguages} | ${entry.evidence.page} |`)
  .join("\n");

const markdown = `# Volcengine TTS 2.0 Voice Catalog\n\n## Verified Scope\n\n- Source: [official exported PDF](official/volcengine-tts2/volcengine-tts2-official.pdf) and its [raw extracted text](official/volcengine-tts2/raw-official-content.txt).\n- Retrieved: 2026-07-14. Source page update shown in the PDF: 2026-07-13 10:25:43.\n- Included: ${catalog.length} standard voices explicitly listed under the official Doubao Voice Synthesis Model 2.0 heading. ${chineseVoiceCount} are Chinese and eligible only for later casting review.\n- Excluded: ICL rows, Model 1.0 rows, end-to-end S2S rows, and any voice not in that heading.\n\n## Emotion Boundary\n\nThe official Model 2.0 standard-voice table lists instruction-following capability, but it does **not** provide a fixed Model 2.0 emotion enum, an API field location, a strength range, or per-voice emotion compatibility. The fixed emotion table in the PDF is visibly under the Model 1.0 heading. It is not used here.\n\nTherefore every Model 2.0 record uses \`emotion.status: unavailable\`. No runtime request, casting decision, or sample generation may use an \`emotion\` parameter until a separate official API reference supplies the valid field and values.\n\n## Structured Data\n\nThe complete machine-readable evidence, including verified status and source pages, is in [assets/volcengine-tts2-voice-catalog.json](../assets/volcengine-tts2-voice-catalog.json).\n\n## Verified Voice Types\n\n| Official name | Official voice_type | Official scene | Official language | PDF page |\n| --- | --- | --- | --- | --- |\n${table}\n`;

await writeFile(jsonPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
await writeFile(
  markdownPath,
  markdown.replace(
    "[official exported PDF](official/volcengine-tts2/volcengine-tts2-official.pdf) and its [raw extracted text](official/volcengine-tts2/raw-official-content.txt)",
    "owner-supplied official Volcengine PDF export, preserved as sanitized [raw extracted text](official/volcengine-tts2/raw-official-content.txt) and sanitized screenshots in [the evidence directory](official/volcengine-tts2/)",
  ),
  "utf8",
);
console.log(`Wrote ${catalog.length} verified Model 2.0 standard voices (${chineseVoiceCount} Chinese).`);
