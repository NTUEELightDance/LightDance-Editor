/**
 * Usage: node addLedSword.js <path_to_position.json> <output_path.json>
 */

const fs = require("fs");
const { exit } = require("process");

const led_sword_default = {
  "1_sw": {
    x: -599.5792867265321,
    y: -333.7327965887821,
    z: -333.7327965887821,
  },
  "2_sw": {
    x: -550.3384243140316,
    y: -284.74304865624,
    z: -284.74304865624,
  },
  "3_sw": {
    x: -603.9760248612921,
    y: -15.778998425016482,
    z: -15.778998425016482,
  },
  "4_sw": {
    x: -552.1787181424224,
    y: 17.420497486803185,
    z: 17.420497486803185,
  },
  "5_sw": {
    x: 445.41199683688524,
    y: -293.02880795483486,
    z: -293.02880795483486,
  },
  "6_sw": {
    x: 488.9454375268913,
    y: -250.5843343942272,
    z: -250.5843343942272,
  },
  "7_sw": {
    x: 535.2955518764238,
    y: -196.6074811364183,
    z: -196.6074811364183,
  },
  "8_sw": {
    x: 441.50144207035487,
    y: -15.384031548741461,
    z: -15.384031548741461,
  },
  "9_sw": {
    x: 489.24915097340704,
    y: 22.11243053364842,
    z: 22.11243053364842,
  },
  "10_sw": {
    x: 546.7498041637546,
    y: 64.53520563582373,
    z: 64.53520563582373,
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
let position = JSON.parse(raw);
position = position.map((frame) => {
  return { ...frame, pos: { ...frame.pos, ...led_sword_default } };
});

// Write File
fs.writeFile(outputPath, JSON.stringify(position), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
