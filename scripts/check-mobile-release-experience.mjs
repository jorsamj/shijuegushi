import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const index = read("index.html");
const script = read("script.js");
const mobileCss = read("mobile-story.css");
const context = { window: {} };
vm.runInNewContext(read("story-data.js"), context, { filename: "story-data.js" });
const data = context.window.MIST_DATA;

expect(!index.includes("data-close-modal"), "Modal chrome must not expose a dismiss-by-scrim or close-X control.");
expect(script.includes("requestImmersiveMode"), "A first-gesture fullscreen attempt is required.");
expect(script.includes("bindDialogueAdvance"), "Reading dialogue needs a panel-wide advance handler.");
expect(script.includes("preloadUpcomingVisuals"), "The next scene and character assets need preloading.");
expect(script.includes("modalMode"), "Modal close behavior must distinguish notice and confirmation modes.");
expect(mobileCss.includes(".mobile-story-root"), "Mobile game layout must be isolated behind one root selector.");
expect(mobileCss.includes("left: 50%") && mobileCss.includes("translateX(-50%)"), "The mobile dialogue panel must be centered from a single anchor.");
expect(mobileCss.includes("env(safe-area-inset-left)") && mobileCss.includes("env(safe-area-inset-right)"), "The mobile dialogue panel must honor both horizontal safe areas.");
expect(mobileCss.includes("svh") && mobileCss.includes("dvh"), "The mobile viewport needs stable and dynamic height fallbacks.");
const choicePanelBlock = mobileCss.match(/\.mobile-story-root\.is-choice-node \.dialogue-panel\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";
expect(/bottom:\s*max\(10px, env\(safe-area-inset-bottom\)\)/.test(choicePanelBlock), "Choice controls must remain fixed above the mobile bottom safe area.");
expect(!/top:\s*max\(/.test(choicePanelBlock), "Choice controls must not move to the top of the mobile viewport.");
expect(Number(data.mobileTextBeatCount || 0) >= 10, "Long narrative nodes must be split into mobile reading beats.");

const longNodes = Object.values(data.nodes || {}).filter((node) => {
  if (node.type === "choice" || node.type === "deduction" || node.type === "ending" || node.resolveEnding) return false;
  return String(node.text || "").replace(/\s+/g, "").length > 112;
});
expect(longNodes.length === 0, `Reading nodes exceed the mobile text budget: ${longNodes.map((node) => node.nodeId).join(", ")}`);

if (failures.length) {
  console.error("Mobile release experience check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Mobile release experience check passed.");
