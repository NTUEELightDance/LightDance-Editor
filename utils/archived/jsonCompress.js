/* eslint-disable camelcase */
/* eslint-disable no-console */
/**
 * Usage: node controlTransform.js <path_to_control.json>
 */

const fs = require("fs");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: controlTransform.js
if (args.length < 3) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const inputPath = args[2];

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

// Write File
fs.writeFile(inputPath, JSON.stringify(control), () => {
  console.log(`Writing new file to ... ${inputPath}`);
});
