/**
 * Usage: node addLedSword.js <path_to_control.json> <output_path.json>
 */

const fs = require("fs");
const { exit } = require("process");

const led_sword_default = {
  "1_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
  "2_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
  "3_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
  "4_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
  "5_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
  "6_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
  "7_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
  "8_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
  "9_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
  "10_sw": {
    LED_HANDLE: { src: "bl_handle", alpha: 0 },
    LED_GUARD: { src: "bl_guard", alpha: 0 },
    LED_SWORD: { src: "bl_sword", alpha: 0 },
  },
};

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
let control = JSON.parse(raw);
control = control.map((frame) => {
  return { ...frame, status: { ...frame.status, ...led_sword_default } };
});

// Write File
fs.writeFile(outputPath, JSON.stringify(control), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
