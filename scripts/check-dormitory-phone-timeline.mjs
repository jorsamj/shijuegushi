import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(root, "assets/stories/dormitory-rollcall/story-data.js"), "utf8"),
  context,
  { filename: "dormitory-story-data.js" },
);

const data = context.window.MIST_DORMITORY_DATA;
const nodes = Object.values(data?.nodes || {});
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const chinese = /[\u3400-\u9FFF]/u;
const messageIds = new Set();
const phoneNodes = nodes.filter((node) => node.phoneScreen);
const phoneChapters = new Set();
const lastTimeByChapter = new Map();
let messageCount = 0;

function parseTime(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? hour * 60 + minute : null;
}

function roleName(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  for (const key of ["name", "label", "displayName", "nickname", "character", "sender", "senderName", "from", "author"]) {
    if (typeof value[key] === "string") return value[key];
  }
  return "";
}

assert(phoneNodes.length > 0, "Dormitory story must declare structured phoneScreen nodes.");
for (const node of phoneNodes) {
  const phone = node.phoneScreen;
  const minutes = parseTime(phone.time);
  assert(minutes !== null, `${node.nodeId} phoneScreen.time must be a valid HH:MM value.`);
  assert(Number.isInteger(phone.battery) && phone.battery >= 0 && phone.battery <= 100, `${node.nodeId} phoneScreen.battery must be an integer from 0 to 100.`);
  assert(typeof phone.signal === "string" && phone.signal.trim().length > 0, `${node.nodeId} phoneScreen.signal must be a non-empty status.`);
  assert(typeof phone.kind === "string" && phone.kind.trim().length > 0, `${node.nodeId} phoneScreen.kind is required.`);
  assert(Array.isArray(phone.members), `${node.nodeId} phoneScreen.members must be an array of Chinese character entries.`);
  assert(Array.isArray(phone.messages), `${node.nodeId} phoneScreen.messages must be an array.`);

  if (phone.members) {
    for (const [index, member] of phone.members.entries()) {
      const name = roleName(member);
      assert(chinese.test(name), `${node.nodeId} phone member ${index} must have a Chinese character name.`);
    }
  }
  if (phone.messages) {
    for (const [index, message] of phone.messages.entries()) {
      messageCount += 1;
      assert(typeof message?.id === "string" && message.id.trim().length > 0, `${node.nodeId} phone message ${index} needs a stable message id.`);
      if (message?.id) {
        assert(!messageIds.has(message.id), `${node.nodeId} reuses phone message id ${message.id}.`);
        messageIds.add(message.id);
      }
      assert(chinese.test(roleName(message)), `${node.nodeId} phone message ${index} must identify a Chinese character.`);
    }
  }

  phoneChapters.add(node.chapterId);
  if (minutes !== null) {
    const previous = lastTimeByChapter.get(node.chapterId);
    assert(previous === undefined || minutes >= previous, `${node.nodeId} phone time ${phone.time} moves backward within ${node.chapterId}.`);
    lastTimeByChapter.set(node.chapterId, minutes);
  }
}

assert(messageCount > 0, "Dormitory phone timeline must contain at least one message with an id.");
const chapterIds = (data?.chapters || []).map((chapter) => chapter.chapterId);
assert(chapterIds.length === 6, `Dormitory phone timeline expects six chapters; got ${chapterIds.length}.`);
for (const chapterId of chapterIds) {
  assert(phoneChapters.has(chapterId), `${chapterId} has no phoneScreen timeline entry.`);
}

if (failures.length) {
  console.error("Dormitory phone timeline check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Dormitory phone timeline check passed.");
console.log(`phoneNodes=${phoneNodes.length}`);
console.log(`messageCount=${messageCount}`);
console.log(`chapters=${phoneChapters.size}`);
