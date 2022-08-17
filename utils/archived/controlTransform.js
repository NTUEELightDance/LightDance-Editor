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

// Transform
console.log("Transforming ...");
const P0 = "dancer0";
const control_transform = [];
control[P0].forEach((frame, idx) => {
  const newFrame = { start: frame.Start };
  newFrame.status = {};
  Object.entries(control).forEach(([key, value]) => {
    const newKey = `dancer${key[key.length - 1]}`; // turn dancer0 to dancer0
    newFrame.status[newKey] = value[idx].Status;
  });
  control_transform.push(newFrame);
});
// console.log(control_transform);

// Write File
fs.writeFile(outputPath, JSON.stringify(control_transform), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
