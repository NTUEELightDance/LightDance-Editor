/**
 * Usage: node checkPos.js <path_to_position.json>
 */

const checkPosJson = (position) => {
  if (!Array.isArray(position) || position.length === 0) {
    console.error("[Error] position not array or position is empty");
    return false;
  }
  return position.every((frame, frameIdx) => {
    if (!("start" in frame)) {
      console.error(`[Error] "start" is undefined in frame ${frameIdx}`);
      return false;
    }
    if (!("pos" in frame)) {
      console.error(`[Error] "pos" is undefined in frame ${frameIdx}`);
      return false;
    }
    return Object.entries(frame.pos).every(([dancerName, { x, y, z }]) => {
      if (
        typeof x !== "number" ||
        typeof y !== "number" ||
        typeof z !== "number"
      ) {
        console.error(
          `[Error] x, y, z not number in frame ${frameIdx} and dancer ${dancerName}`
        );
        return false;
      }
      return true;
    });
  });
};

const fs = require("fs");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: positionTransform.js
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
const position = JSON.parse(raw);
const checkResult = checkPosJson(position);

if (checkResult) console.log("Check Success !!!");
else console.log("Check Failed !");
