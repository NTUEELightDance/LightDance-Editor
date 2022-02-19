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
  { name: "Calf_R", type: "FIBER" },
  { name: "Thigh_R", type: "FIBER" },
  { name: "LymphaticDuct_R", type: "FIBER" },
  { name: "Waist_R", type: "FIBER" },
  { name: "Arm_R", type: "FIBER" },
  { name: "Shoulder_R", type: "FIBER" },
  { name: "CollarBone_R", type: "FIBER" },
  { name: "Chest", type: "FIBER" },
  { name: "Visor", type: "FIBER" },
  { name: "Ear_R", type: "FIBER" },
  { name: "Calf_L", type: "FIBER" },
  { name: "Thigh_L", type: "FIBER" },
  { name: "LymphaticDuct_L", type: "FIBER" },
  { name: "Waist_L", type: "FIBER" },
  { name: "CollarBone_L", type: "FIBER" },
  { name: "Arm_L", type: "FIBER" },
  { name: "Ear_L", type: "FIBER" },
  { name: "Shoulder_L", type: "FIBER" },
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
  { name: "Capacitor_1", type: "FIBER" },
  { name: "Capacitor_2", type: "FIBER" },
  { name: "Surcoat", type: "FIBER" },
  { name: "Wrist_R", type: "FIBER" },
  { name: "Tie", type: "FIBER" },
  { name: "Boot_R", type: "FIBER" },
  { name: "Mask", type: "FIBER" },
  { name: "Eyes", type: "FIBER" },
  { name: "Chest", type: "FIBER" },
  { name: "Collar", type: "FIBER" },
  { name: "Rune", type: "FIBER" },
  { name: "Rune_R", type: "FIBER" },
  { name: "Arm_R", type: "FIBER" },
  { name: "Arm_L", type: "FIBER" },
  { name: "Wrist_L", type: "FIBER" },
  { name: "Boot_L", type: "FIBER" },
  { name: "Rune_L", type: "FIBER" },
  { name: "Shoe_R_LED", type: "LED" },
  { name: "Shoe_L_LED", type: "LED" },
  { name: "Chest_LED", type: "LED" },
  { name: "Wrist_R_LED", type: "LED" },
  { name: "Wrist_L_LED", type: "LED" },
  { name: "Eyes_LED", type: "LED" },
];

const BLUE_DANCER = [
  { name: "Calf_R", type: "FIBER" },
  { name: "Thigh_R", type: "FIBER" },
  { name: "Arm_R", type: "FIBER" },
  { name: "Thigh_L", type: "FIBER" },
  { name: "Shoulder_R", type: "FIBER" },
  { name: "Cuirass", type: "FIBER" },
  { name: "Shoulder_L", type: "FIBER" },
  { name: "Plackart", type: "FIBER" },
  { name: "Belt", type: "FIBER" },
  { name: "Helmet", type: "FIBER" },
  { name: "Calf_L", type: "FIBER" },
  { name: "Arm_L", type: "FIBER" },
  { name: "Shoe_R_LED", type: "LED" },
  { name: "Hand_R_LED", type: "LED" },
  { name: "Hand_L_LED", type: "LED" },
  { name: "Shoe_L_LED", type: "LED" },
  { name: "Shoulder_L_LED", type: "LED" },
  { name: "Shoulder_R_LED", type: "LED" },
];

const DANCER = [
  { parts: YELLOW_DANCER, name: "1_chi" },
  { parts: YELLOW_DANCER, name: "2_meow" },
  { parts: YELLOW_DANCER, name: "3_yeee" },
  { parts: YELLOW_DANCER, name: "4_breaKing" },
  { parts: YELLOW_DANCER, name: "5_itzyboo" },
  { parts: BLUE_DANCER, name: "6_yu" },
  { parts: BLUE_DANCER, name: "7_wang" },
  { parts: BLUE_DANCER, name: "8_hao" },
  { parts: BLUE_DANCER, name: "9_monkey" },
  { parts: BLUE_DANCER, name: "10_dontstop" },
  { parts: RED_DANCER, name: "11_wish" },
];

const status = {};
const old_pos = [
  {
    x: -306.96464010479804,
    y: -184.2666717529297,
    z: -184.2666717529297,
  },
  {
    x: -160.96464010479804,
    y: -180.93332824707034,
    z: -180.93332824707034,
  },
  {
    x: -36.964640104798036,
    y: -81.59998474121095,
    z: -81.59998474121095,
  },
  {
    x: 0.3687034010613388,
    y: -184.2666717529297,
    z: -184.2666717529297,
  },
  {
    x: -376.96464010479804,
    y: -76.93332824707032,
    z: -76.93332824707032,
  },
  {
    x: -195.63129659893866,
    y: -76.2666717529297,
    z: -76.2666717529297,
  },
  {
    x: 131.03535989520196,
    y: -73.59998474121095,
    z: -73.59998474121095,
  },
  {
    x: 109.70204690692071,
    y: -270.93332824707034,
    z: -270.93332824707034,
  },
  { x: 123.03535989520196, y: -275.6, z: -275.6 },
  {
    x: 132.36873391863946,
    y: -258.2666717529297,
    z: -258.2666717529297,
  },
  {
    x: 132.36873391863946,
    y: -128.2666717529297,
    z: -128.2666717529297,
  },
];

const pos = {};

DANCER.forEach((dancer, i) => {
  const { parts, name } = dancer;
  status[name] = {};
  parts.forEach((part) => {
    switch (part.type) {
      case "LED":
        status[name][part.name] = { src: "", alpha: 0 };
        break;
      case "FIBER":
        // status[name][part.name] = { color: "black", alpha: 0 };
        const index = Number(name.split("_")[0]);
        if (index <= 5 && index >= 0)
          status[name][part.name] = { color: "yellow", alpha: 1 };
        if (index <= 10 && index >= 6)
          status[name][part.name] = { color: "blue", alpha: 1 };
        if (index === 11) status[name][part.name] = { color: "red", alpha: 1 };
        break;
      default:
    }
  });
  pos[name] = old_pos[i];
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
