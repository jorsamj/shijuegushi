import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, ".."); const ctx={window:{}}; vm.runInNewContext(fs.readFileSync(path.join(root,"assets/stories/dormitory-namefloor/formal/visual-manifest.js"),"utf8"),ctx); const assets=ctx.window.DORMITORY_NAMEFLOOR_FORMAL_VISUALS.assets;
const states=["guarded","wounded_exhausted","explaining_system","guilty_stay"], source="assets/stories/dormitory-namefloor/formal/characters/char_manager_wu_master_upper_neutral.png";
for(const stateId of states){const a=assets.find(x=>x.characterId==="manager_wu"&&x.stateId===stateId);if(!a||a.assetType!=="character-state"||a.sourceMaster!==source||a.model!=="gpt-image-2"||a.width!==1024||a.height!==1536||a.alpha!==true||a.runtimeIntegrated!==false||a.batchStatus!=="complete")throw new Error(`invalid manager Wu metadata: ${stateId}`);const b=fs.readFileSync(path.join(root,a.path));if(!b.length||!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||b.readUInt32BE(16)!==1024||b.readUInt32BE(20)!==1536||b[25]!==6)throw new Error(`invalid manager Wu PNG: ${stateId}`)}
console.log("phase-6 formal visuals OK: 4 approved manager Wu state images");
