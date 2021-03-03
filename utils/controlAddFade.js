/**
 * node controlAddFade.js <path_to_control.json> <output_path.json>
 */

const fs = require("fs");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: controlTransform.js
if (args.length < 4) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const inputPath = args[2];
const outputPath = args[3];

// Read File
console.log("Reading json from ... ", inputPath);
let raw = null;
try {
  raw = fs.readFileSync(inputPath);
} catch (err) {
  console.error(`[Error] Can't open file ${inputPath}`);
  exit();
}
const control = JSON.parse(raw);

// Add Fade to old control
console.log("Add Fade ...");
const control_add_fade = control.map((c) => ({ ...c, fade: false }));

// console.log(control_transform);

// Write File
fs.writeFile(outputPath, JSON.stringify(control_add_fade), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
