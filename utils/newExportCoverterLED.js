/**
 * Usage: node newExportCoverter.js <path_to.json>  <output_path.json>
 */

const fs = require("fs");
const { stat } = require("fs/promises");
const { exit } = require("process");

// Read Argument
const args = process.argv; // 0: node, 1: posCenter.js
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

const { position, control, dancer } = JSON.parse(raw);

const YELLOW_DANCER = [
  { name: "Glove_L_LED", type: "LED" },
  { name: "Glove_R_LED", type: "LED" },
  { name: "Visor_LED", type: "LED" },
  { name: "CollarBone_R_LED", type: "LED" },
  { name: "CollarBone_L_LED", type: "LED" },
  { name: "Shoe_R_LED", type: "LED" },
  { name: "Shoe_L_LED", type: "LED" },
  { name: "Shoulder_R_LED", type: "LED" },
  { name: "Shoulder_L_LED", type: "LED" },
  { name: "Hand_R_LED", type: "LED" },
  { name: "Hand_L_LED", type: "LED" },
];

const RED_DANCER = [
  { name: "Rune_LED", type: "LED" },
  { name: "Rune_L_LED", type: "LED" },
  { name: "Rune_R_LED", type: "LED" },
  { name: "Shoe_R_LED", type: "LED" },
  { name: "Shoe_L_LED", type: "LED" },
  { name: "Chest_LED", type: "LED" },
  { name: "Wrist_R_LED", type: "LED" },
  { name: "Wrist_L_LED", type: "LED" },
  { name: "Eyes_LED", type: "LED" },
];

const BLUE_DANCER = [
  { name: "Glove_L_LED", type: "LED" },
  { name: "Glove_R_LED", type: "LED" },
  { name: "Shoe_R_LED", type: "LED" },
  { name: "Hand_R_LED", type: "LED" },
  { name: "Hand_L_LED", type: "LED" },
  { name: "Shoe_L_LED", type: "LED" },
  { name: "Shoulder_L_LED", type: "LED" },
  { name: "Shoulder_R_LED", type: "LED" },
];

const DANCER = [
  {
    num: 36,
    parts: [],
    name: "Visor_LED",
  },
];

const status = {};

const pos = { Visor_LED: { x: 0, y: 0, z: 0 } };

DANCER.forEach((dancer, i) => {
  const { parts, name, num } = dancer;
  status[name] = {};
  for (let i = 0; i < num; i++) {
    parts.push({
      name: `${name}${String(i).padStart(3, "0")}`,
      type: "FIBER",
    });
  }
  parts.forEach((part) => {
    switch (part.type) {
      case "FIBER":
        status[name][part.name] = { color: "yellow", alpha: 1 };
      default:
        console.log("Not Fiber!!!");
    }
  });
  delete dancer["num"];
});

const CONTROL = {
  "01HvN": {
    fade: false,
    start: 0,
    status,
  },
};

const POSITION = {
  "0006T": {
    start: 0,
    pos,
  },
};

const COLOR = {
  black: "#000000",
  red: "#FF04FF",
  blue: "#05FFFF",
  yellow: "#FFFF2d",
};

const exportJSON = {
  position: POSITION,
  control: CONTROL,
  dancer: DANCER,
  color: COLOR,
};

console.log(exportJSON);

fs.writeFile(outputPath, JSON.stringify(exportJSON), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
