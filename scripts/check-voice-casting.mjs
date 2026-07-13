import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/voice-casting-manifest.js"), "utf8"), context);
const casting = context.window.SECOND_LIFE_VOICE_CASTING;
const failures = [];
const roles = Object.values(casting?.roles || {});
if (casting?.storyId !== "script_dormitory_rollcall") failures.push("Casting manifest must target the dormitory story.");
if (roles.length !== 9) failures.push(`Dormitory story needs nine distinct speaking roles; got ${roles.length}.`);
const vcns = roles.map((role) => role.vcn).filter(Boolean);
if (new Set(vcns).size !== roles.length) failures.push("Every dormitory speaking role must use a unique vcn.");
for (const role of roles) if (role.apiTestStatus !== "authorised" || !role.vcn) failures.push(`${role.label || role.roleId} is not authorised.`);
if (failures.length) { console.error("Voice casting check failed:"); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Voice casting check passed. roles=${roles.length}; uniqueVcns=${new Set(vcns).size}; provider=${casting.provider}`);
