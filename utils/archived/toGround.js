/**
 * Usage: node toGround.js <path_to.json>  <output_path.json>
 */

const fs = require("fs");

const { exit } = require("process");
const _ = require("lodash");

// Read Argument
const args = process.argv; // 0: node, 1: toGround.js
if (args.length < 4) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const json = args[2];
const outputPath = args[3];

console.log("Reading json from ... ", json);
let raw = null;

try {
  raw = fs.readFileSync(json);
} catch (err) {
  console.error(`[Error] Can't open file ${json}`);
  exit();
}

const { position, control, dancer, color } = JSON.parse(raw);

const newPosition = _.cloneDeep(position);

Object.entries(position).forEach(([id, { pos }]) => {
  Object.keys(pos).forEach((dancerName) => {
    newPosition[id]["pos"][dancerName].y = 0;
  });
});

const exportJSON = {
  position: newPosition,
  control,
  dancer,
  color,
};

console.log(exportJSON);

fs.writeFile(outputPath, JSON.stringify(exportJSON), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
