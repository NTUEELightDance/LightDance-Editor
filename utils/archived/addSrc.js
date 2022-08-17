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
control.forEach((c) => {
  Object.entries(c.status).forEach(([dancerName, dancerStatus]) => {
    if (dancerStatus["LED_CHEST"].src.length === 0) {
      dancerStatus["LED_CHEST"].src = "bl_chest";
    }
    if (dancerStatus["LED_L_SHOE"].src.length === 0) {
      dancerStatus["LED_L_SHOE"].src = "bl_shoe";
    }
    if (dancerStatus["LED_R_SHOE"].src.length === 0) {
      dancerStatus["LED_R_SHOE"].src = "bl_shoe";
    }

    if (dancerStatus["LED_FAN"].src.length === 0) {
      dancerStatus["LED_FAN"].src = "bl_fan";
    }

    if ("L_SHOES2" in dancerStatus) delete dancerStatus["L_SHOES2"];
    if ("R_SHOES2" in dancerStatus) delete dancerStatus["R_SHOES2"];
  });
});

// Write File
fs.writeFile(outputPath, JSON.stringify(control), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
