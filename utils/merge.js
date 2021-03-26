/**
 * Usage: node merge.js <path_to_1.json> <path_to_2.json> <output_path.json>
 */

// This merge is not complete, only put json1 in front of json2

const fs = require("fs");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: posCenter.js
if (args.length < 5) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const json_1 = args[2];
const json_2 = args[3];
const outputPath = args[4];

// Read File
console.log("Reading json from ... ", json_1);
let raw = null;
try {
  raw = fs.readFileSync(json_1);
} catch (err) {
  console.error(`[Error] Can't open file ${json_1}`);
  exit();
}
const json1 = JSON.parse(raw);

console.log("Reading json from ... ", json_2);
raw = null;
try {
  raw = fs.readFileSync(json_2);
} catch (err) {
  console.error(`[Error] Can't open file ${json_2}`);
  exit();
}
const json2 = JSON.parse(raw);

// Write File
fs.writeFile(outputPath, JSON.stringify([...json1, ...json2]), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
