/**
 * Usage: node addLedSwordHandle.js <path_to.json> <output_path.json>
 */

// This merge is not complete, only put json1 in front of json2

const fs = require("fs");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: posCenter.js
if (args.length < 3) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const json = args[2];
const outputPath = args[3];

// Read File
console.log("Reading json from ... ", json);
let raw = null;
try {
  raw = fs.readFileSync(json);
} catch (err) {
  console.error(`[Error] Can't open file ${json}`);
  exit();
}
const control = JSON.parse(raw);

const swordsDancer = [
  "1_sw",
  "2_sw",
  "3_sw",
  "4_sw",
  "5_sw",
  "6_sw",
  "7_sw",
  "8_sw",
  "9_sw",
  "10_sw",
];

// 480
control.forEach(({ status }, idx) => {
  if (idx >= 480) {
    swordsDancer.forEach((sword) => {
      console.log(sword);
      if (status[sword]) {
        if (
          status[sword]["LED_SWORD"].src !== "bl_sword" &&
          status[sword]["LED_SWORD"].alpha !== 0
        ) {
          if (status[sword]["LED_SWORD"].src.includes("white")) {
            status[sword]["LED_HANDLE"] = { src: "white_handle", alpha: 0.5 };
            status[sword]["LED_GUARD"] = { src: "white_guard", alpha: 0.5 };
          } else if (status[sword]["LED_SWORD"].src.includes("blue")) {
            status[sword]["LED_HANDLE"] = { src: "blue_handle", alpha: 1 };
            status[sword]["LED_GUARD"] = { src: "blue_guard", alpha: 1 };
          } else if (status[sword]["LED_SWORD"].src.includes("red")) {
            status[sword]["LED_HANDLE"] = { src: "red_handle", alpha: 1 };
            status[sword]["LED_GUARD"] = { src: "red_guard", alpha: 1 };
          }
        }
      }
    });
  }
});

// Write File
fs.writeFile(outputPath, JSON.stringify(control), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
