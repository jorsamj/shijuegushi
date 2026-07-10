import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const manifestSource = read("assets/external-audio-manifest.js");
const manifestContext = { window: {} };
vm.runInNewContext(manifestSource, manifestContext);
const entryTheme = manifestContext.window.SECOND_LIFE_EXTERNAL_AUDIO?.bgm?.life_archive_theme;
expect(entryTheme, "Entry music must be registered in the approved external audio manifest.");
expect(entryTheme?.mixRole === "life archive entry theme", "Entry music must carry the dedicated archive mix role.");
expect(entryTheme?.path && fs.existsSync(path.join(root, entryTheme.path)), "Entry music path must exist in the published asset tree.");

const script = read("script.js");
expect(script.includes("function startEntryMusic"), "Runtime must start entry music after a user gesture.");
expect(script.includes("function stopEntryMusic"), "Runtime must fade entry music out before story audio starts.");
expect(script.includes('startEntryMusic("life_archive_theme")'), "Archive views must request the entry theme.");
expect(script.includes('stopEntryMusic("story-enter")'), "Entering the story must retire the entry theme.");

const index = read("index.html");
expect(index.includes("viewport-fit=cover"), "Viewport must account for mobile safe areas.");
expect(index.includes('rel="manifest"'), "The public build must expose a web app manifest.");

const workflowPath = path.join(root, ".github", "workflows", "deploy-pages.yml");
expect(fs.existsSync(workflowPath), "GitHub Pages deployment workflow is missing.");
if (fs.existsSync(workflowPath)) {
  const workflow = fs.readFileSync(workflowPath, "utf8");
  expect(workflow.includes("actions/deploy-pages"), "GitHub Pages workflow must deploy the static artifact.");
  expect(workflow.includes("main"), "GitHub Pages workflow must publish updates from main.");
}

if (failures.length) {
  console.error("Entry experience check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Entry experience check passed.");
