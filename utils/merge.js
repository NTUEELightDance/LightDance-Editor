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

function compareNumbers(a, b) {
  return a.start - b.start;
}

// check json1 increasing
json1.sort(compareNumbers);
for (let i = 0; i < json1.length - 1; ++i) {
  if (json1[i].start > json1[i + 1].start) {
    console.error(`[Error] ${json_1} at ${i} is not an increasing format`);
    exit();
  }
}

// check json2 increasing
json2.sort(compareNumbers);
for (let i = 0; i < json2.length - 1; ++i) {
  if (json2[i].start > json2[i + 1].start) {
    console.error(`[Error] ${json_2} at ${i} is not an increasing format`);
    exit();
  }
}

// merge
const new_json = [];
let i = 0,
  j = 0;
for (let k = 0; k < json1.length + json2.length; ++k) {
  if (i >= json1.length || j >= json2.length) break;
  if (json1[i].start >= json2[j].start) {
    new_json.push(json2[j]);
    j += 1;
  } else if (json1[i].start < json2[j].start) {
    new_json.push(json1[i]);
    i += 1;
  }
}

if (i === json1.length) {
  for (j; j < json2.length; ++j) new_json.push(json2[j]);
} else if (j === json2.length) {
  for (i; i < json1.length; ++i) new_json.push(json1[j]);
}

// check new json increasing
for (let i = 0; i < new_json.length - 1; ++i) {
  if (new_json[i].start > new_json[i + 1].start) {
    console.error(`[Error] ${new_json} at ${i} is not an increasing format`);
    exit();
  }
}

// Write File
fs.writeFile(outputPath, JSON.stringify(new_json), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
