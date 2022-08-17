/**
 * Usage: node posCenter.js <path_to_pos.json> <output_path.json>
 */

const fs = require("fs");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: posCenter.js
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
const position = JSON.parse(raw);

// Centering
const centerX = 650;
const centerY = 300;

position.forEach(({ pos }) => {
  Object.values(pos).forEach((val) => {
    val.x -= centerX;
    val.y -= centerY;
    val.z -= centerY;
  });
});

// Write File
fs.writeFile(outputPath, JSON.stringify(position), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
