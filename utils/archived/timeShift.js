/**
 * Usage: node timeShift.js shift_time <path_to_.json> <output_path.json>
 */

const { constants } = require("buffer");
const fs = require("fs");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: posCenter.js
if (args.length < 5) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const timeShift = args[2];
const inputPath = args[3];
const outputPath = args[4];

// Read File
console.log("Reading json from ... ", inputPath);
let raw = null;
try {
  raw = fs.readFileSync(inputPath);
} catch (err) {
  console.error(`[Error] Can't open file ${inputPath}`);
  exit();
}
const json = JSON.parse(raw);

// time shifting
json.map((frame) => {
  frame.start += parseInt(timeShift, 10);
});

// Write File
fs.writeFile(outputPath, JSON.stringify(json), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
