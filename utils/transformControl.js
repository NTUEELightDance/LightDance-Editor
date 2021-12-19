/**
 * Usage: node transformControl.js <path_to_control.js> <output_controlRecord.json> <output_controlMap.json>
 */

const fs = require("fs");
const { exit } = require("process");
const { nanoid } = require("nanoid");

const args = process.argv;

if (args.length < 5) {
  console.error(`[Error] Invalid number of arguments!`);
  exit();
}

const inputPath = args[2];
const controlRecordPath = args[3];
const controlMapPath = args[4];

// Read File
console.log(`Reading json from ${inputPath}`);
let raw = null;
try {
  raw = fs.readFileSync(inputPath);
} catch (err) {
  console.error(err);
  exit();
}

const oldControlRecord = JSON.parse(raw);

const controlRecord = [];
const controlMap = {};

for (const control of oldControlRecord) {
  const id = nanoid(6);
  controlRecord.push(id);
  controlMap[id] = control;
}

// Write File
fs.writeFile(controlRecordPath, JSON.stringify(controlRecord), () => {
  console.log(`Writing controlRecord to ${controlRecordPath}`);
});

fs.writeFile(controlMapPath, JSON.stringify(controlMap), () => {
  console.log(`Writing controlMap to ${controlMapPath}`);
});
