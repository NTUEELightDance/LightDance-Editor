/* eslint-disable camelcase */
/* eslint-disable no-console */
/**
 * Usage: node controlTransform.js <path_to_control.json> <output_path.json>
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
const LED_NECKTIE = { src: "bl_necktie", alpha: 0 };
control.map(({ status }) => {
  Object.values(status).map((s) => (s["LED_NECKTIE"] = LED_NECKTIE));
});

// Write File
fs.writeFile(outputPath, JSON.stringify(control), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
