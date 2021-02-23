/**
 * node controlAddFade.js <path_to_control.json> <output_path.json>
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

// Add Fade to old control
console.log("Add Fade ...");
const control_add_fade = control.map((c) => ({ ...c, fade: false }));

// console.log(control_transform);

// Write File
fs.writeFile(outputPath, JSON.stringify(control_add_fade), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});

// const old_control = [
//   {
//     start: 0,
//     start: {
//       dancer0: {
//         HAT1: 0,
//         HAT2: 0.7,
//         FACE1: 0.7,
//         FACE2: 0.7,
//         INNER1: 0,
//         INNER2: 0.7,
//         L_COAT1: 0,
//         L_COAT2: 0.7,
//         R_COAT1: 0,
//         R_COAT2: 0.7,
//         L_ARM1: 0,
//         L_ARM2: 0.7,
//         R_ARM1: 0,
//         R_ARM2: 0.7,
//         L_HAND: 0.7,
//         R_HAND: 0.7,
//         L_PANTS1: 0,
//         L_PANTS2: 0.7,
//         R_PANTS1: 0,
//         R_PANTS2: 0.7,
//         L_SHOES1: 0.7,
//         L_SHOES2: 0,
//         R_SHOES1: 0.7,
//         R_SHOES2: 0,
//         LED_CHEST: { src: "button_yellow", alpha: 0.7 },
//         LED_R_SHOE: { src: "r_shoe_red", alpha: 0.7 },
//         LED_L_SHOE: { src: "l_shoe_red", alpha: 0.7 },
//         LED_FAN: { src: "fan_all_bright", alpha: 0.7 },
//       },
//       dancer1: {},
//       sword0: {},
//       sword1: {},
//     },
//   },
//   {
//     start: 3000,
//     start: {},
//   },
//   {
//     start: 5000,
//     start: {},
//   },
// ];

// const new_control = [
//   {
//     start: 0,
//     fade: false,
//     start: {
//       dancer0: {
//         HAT1: 0,
//         HAT2: 0.7,
//         FACE1: 0.7,
//         FACE2: 0.7,
//         INNER1: 0,
//         INNER2: 0.7,
//         L_COAT1: 0,
//         L_COAT2: 0.7,
//         R_COAT1: 0,
//         R_COAT2: 0.7,
//         L_ARM1: 0,
//         L_ARM2: 0.7,
//         R_ARM1: 0,
//         R_ARM2: 0.7,
//         L_HAND: 0.7,
//         R_HAND: 0.7,
//         L_PANTS1: 0,
//         L_PANTS2: 0.7,
//         R_PANTS1: 0,
//         R_PANTS2: 0.7,
//         L_SHOES1: 0.7,
//         L_SHOES2: 0,
//         R_SHOES1: 0.7,
//         R_SHOES2: 0,
//         LED_CHEST: { src: "button_yellow", alpha: 0.7 },
//         LED_R_SHOE: { src: "r_shoe_red", alpha: 0.7 },
//         LED_L_SHOE: { src: "l_shoe_red", alpha: 0.7 },
//         LED_FAN: { src: "fan_all_bright", alpha: 0.7 },
//       },
//       dancer1: {},
//       sword0: {},
//       sword1: {},
//     },
//   },
//   {
//     start: 3000,
//     start: {},
//   },
//   {
//     start: 5000,
//     start: {},
//   },
// ];
