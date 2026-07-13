import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/voice-casting-manifest.js"), "utf8"), context);
const casting = context.window.SECOND_LIFE_VOICE_CASTING;
const failures = [];
const dormitoryRoles = Object.values(casting?.stories?.script_dormitory_rollcall?.roles || {});
const rainRoles = Object.values(casting?.stories?.script_rain_call?.roles || {});
const roles = [...dormitoryRoles, ...rainRoles];
if (!casting?.stories?.script_dormitory_rollcall) failures.push("Casting manifest must retain the dormitory story.");
if (!casting?.stories?.script_rain_call) failures.push("Casting manifest must retain the rain-call story.");
if (dormitoryRoles.length !== 9) failures.push(`Dormitory story needs nine distinct speaking roles; got ${dormitoryRoles.length}.`);
if (rainRoles.length !== 8) failures.push(`Rain-call story needs eight distinct speaking roles; got ${rainRoles.length}.`);
const vcns = roles.map((role) => role.vcn).filter(Boolean);
if (new Set(vcns).size !== roles.length) failures.push("Every dormitory speaking role must use a unique vcn.");
for (const role of roles) if (role.apiTestStatus !== "authorised" || !role.vcn) failures.push(`${role.label || role.roleId} is not authorised.`);
if (failures.length) { console.error("Voice casting check failed:"); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Voice casting check passed. dormitoryRoles=${dormitoryRoles.length}; rainRoles=${rainRoles.length}; uniqueVcns=${new Set(vcns).size}; provider=${casting.provider}`);
