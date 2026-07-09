import fs from "node:fs";

const errors = [];
const read = (path) => fs.readFileSync(path, "utf8");

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const html = read("index.html");
const css = read("style.css");
const script = read("script.js");

assert(/<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1(?:\.0)?"/.test(html), "index.html must keep zoom-friendly viewport meta");
assert(css.includes("@media (max-width: 900px)"), "style.css must include mobile breakpoint");
assert(css.includes("max-height: 47dvh"), "mobile dialogue panel must reserve scrollable height");
assert(css.includes("overflow-y: auto"), "mobile dialogue panel must be scrollable");
assert(css.includes("min-height: 44px"), "touch targets must use at least 44px min-height");
assert(css.includes("overflow-wrap: anywhere"), "small labels/buttons must protect against overflow");
assert(script.includes("aria-expanded"), "mobile toolbox menu must expose expanded state");
assert(script.includes("toolbox?.classList.toggle(\"is-open\")"), "mobile toolbox must be toggleable");
assert(script.includes("bindAssetFallbacks"), "runtime must provide asset fallback handling");

for (const selector of [".choice-button", ".continue-button", ".toolbox button", ".dialogue-panel", ".scene-focus-tag"]) {
  assert(css.includes(selector), `${selector} styles must exist`);
}

if (errors.length) {
  console.error("Mobile UI check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Mobile UI check passed.");
