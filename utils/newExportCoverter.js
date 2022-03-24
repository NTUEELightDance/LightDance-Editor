/**
 * Usage: node newExportCoverter.js <path_to.json>  <output_path.json>
 */

const fs = require("fs");
const { stat } = require("fs/promises");
const { exit } = require("process");
const _ = require("lodash");

// Read Argument
const args = process.argv; // 0: node, 1: posCenter.js
if (args.length < 4) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}
const inputPath = args[2];
const outputPath = args[3];

// get input file
console.log("Reading json from ... ", inputPath);
let raw = null;
try {
  raw = fs.readFileSync(inputPath);
} catch (err) {
  console.error(`[Error] Can't open file ${inputPath}`);
  exit();
}

const {
  position: originalPosition,
  control: originalControl,
  dancer,
  color: COLOR,
} = JSON.parse(raw);

const YELLOW_DANCER = [
  { name: "Visor", type: "FIBER" },
  { name: "Chest", type: "FIBER" },
  { name: "Shoulder_R", type: "FIBER" },
  { name: "Shoulder_L", type: "FIBER" },
  { name: "Arm_R", type: "FIBER" },
  { name: "Arm_L", type: "FIBER" },
  { name: "Waist_R", type: "FIBER" },
  { name: "Waist_L", type: "FIBER" },
  { name: "Thigh_R", type: "FIBER" },
  { name: "Thigh_L", type: "FIBER" },
  { name: "Calf_R", type: "FIBER" },
  { name: "Calf_L", type: "FIBER" },

  { name: "Visor_LED", type: "LED" },
  { name: "Shoulder_L_LED", type: "LED" },
  { name: "Shoulder_R_LED", type: "LED" },
  { name: "Hand_L_LED", type: "LED" },
  { name: "Hand_R_LED", type: "LED" },
  { name: "Shoe_R_LED", type: "LED" },
  { name: "Shoe_L_LED", type: "LED" },

  // merged
  { name: "Ear", type: "FIBER" },
  { name: "CollarBone", type: "FIBER" },
  { name: "CollarBone_LED", type: "LED" },

  // separated
  { name: "LymphaticDuct_R_U", type: "FIBER" },
  { name: "LymphaticDuct_R_D", type: "FIBER" },
  { name: "LymphaticDuct_L_U", type: "FIBER" },
  { name: "LymphaticDuct_L_D", type: "FIBER" },

  // deleted
  // fiber: glove
  // LED: glove
];

const RED_DANCER = [
  // Arm ->
  { name: "Shoulder_R", type: "FIBER" },
  { name: "Shoulder_L", type: "FIBER" },

  // Wrist ->
  { name: "Arm_R", type: "FIBER" },
  { name: "Arm_L", type: "FIBER" },

  // Surcoat L R
  { name: "Cape_L", type: "FIBER" },
  { name: "Cape_R", type: "FIBER" },

  { name: "Tie", type: "FIBER" },
  { name: "Rune", type: "FIBER" },

  { name: "Shoe_L_U", type: "FIBER" },
  { name: "Shoe_L_M", type: "FIBER" },
  { name: "Shoe_L_D", type: "FIBER" },
  { name: "Shoe_R_U", type: "FIBER" },
  { name: "Shoe_R_M", type: "FIBER" },
  { name: "Shoe_R_D", type: "FIBER" },

  { name: "Eyes_LED", type: "LED" },

  { name: "CollarBone_LED", type: "LED" },

  { name: "Wrist_L_LED", type: "LED" },
  { name: "Wrist_R_LED", type: "LED" },

  { name: "Shoe_L_LED", type: "LED" },
  { name: "Shoe_R_LED", type: "LED" },
  { name: "Cape_LED", type: "LED" },

  // { name: "Capacitor_1", type: "FIBER" }, ->
  { name: "Stomach_L", type: "FIBER" },
  // { name: "Capacitor_2", type: "FIBER" }, ->
  { name: "Stomach_R", type: "FIBER" },

  // separated parts
  { name: "Mask_1", type: "FIBER" },
  { name: "Mask_2", type: "FIBER" },
  // Chest ->
  { name: "Chest", type: "FIBER" },
  { name: "CollarBone_1", type: "FIBER" },
  { name: "CollarBone_2", type: "FIBER" },

  // deleted
  // Collar
  // { name: "Surcoat", type: "FIBER" },
];

const CYAN_DANCER = [
  { name: "Shoulder_L_LED", type: "LED" },
  { name: "Shoulder_R_LED", type: "LED" },
  { name: "Shoe_R_LED", type: "LED" },
  { name: "Shoe_L_LED", type: "LED" },
  { name: "Hand_R_LED", type: "LED" },
  { name: "Hand_L_LED", type: "LED" },

  // deleted
  // { name: "Glove_L_LED", type: "LED" },
  // { name: "Glove_R_LED", type: "LED" },

  // separated
  { name: "Helmet_1", type: "FIBER" },
  { name: "Helmet_2", type: "FIBER" },
  { name: "Helmet_3", type: "FIBER" },

  { name: "Shoulder_L_1", type: "FIBER" },
  { name: "Shoulder_L_2", type: "FIBER" },
  { name: "Shoulder_R_1", type: "FIBER" },
  { name: "Shoulder_R_2", type: "FIBER" },

  { name: "Plackart_1", type: "FIBER" },
  { name: "Plackart_2", type: "FIBER" },

  { name: "Cuirass_1", type: "FIBER" },
  { name: "Cuirass_2", type: "FIBER" },

  { name: "Arm_L_1", type: "FIBER" },
  { name: "Arm_L_2", type: "FIBER" },
  { name: "Arm_R_1", type: "FIBER" },
  { name: "Arm_R_2", type: "FIBER" },

  { name: "Belt_1", type: "FIBER" },
  { name: "Belt_2", type: "FIBER" },

  { name: "Thigh_L_1", type: "FIBER" },
  { name: "Thigh_L_2", type: "FIBER" },
  { name: "Thigh_R_1", type: "FIBER" },
  { name: "Thigh_R_2", type: "FIBER" },

  { name: "Calf_L_1", type: "FIBER" },
  { name: "Calf_L_2", type: "FIBER" },
  { name: "Calf_R_1", type: "FIBER" },
  { name: "Calf_R_2", type: "FIBER" },

  // new parts
  { name: "Eyes_LED", type: "LED" },
];

const DANCER = [
  { parts: YELLOW_DANCER, name: "1_chi" },
  { parts: YELLOW_DANCER, name: "2_meow" },
  { parts: YELLOW_DANCER, name: "3_yeee" },
  { parts: YELLOW_DANCER, name: "4_breaKing" },
  { parts: YELLOW_DANCER, name: "5_itzyboo" },
  { parts: CYAN_DANCER, name: "6_yu" },
  { parts: CYAN_DANCER, name: "7_wang" },
  { parts: CYAN_DANCER, name: "8_hao" },
  { parts: CYAN_DANCER, name: "9_monkey" },
  { parts: CYAN_DANCER, name: "10_dontstop" },
  { parts: RED_DANCER, name: "11_wish" },
];

const RED_STATUS = {};
RED_DANCER.forEach(({ name, type }) => {
  RED_STATUS[name] =
    type === "FIBER" ? { color: "red", alpha: 0 } : { src: "", alpha: 0 };
});

const partmaps = {
  yellow: {
    // merge
    Ear_R: "Ear",
    Ear_L: null,
    CollarBone_R: "CollarBone",
    CollarBone_L: null,
    CollarBone_R_LED: "CollarBone_LED",
    CollarBone_L_LED: null,
    // separated
    LymphaticDuct_R: ["LymphaticDuct_R_U", "LymphaticDuct_R_D"],
    LymphaticDuct_L: ["LymphaticDuct_L_U", "LymphaticDuct_L_D"],
    // deleted
    Glove_R: null,
    Glove_L: null,
    Glove_R_LED: null,
    Glove_L_LED: null,
  },
  cyan: {
    // separated
    Helmet: ["Helmet_1", "Helmet_2", "Helmet_3"],

    Shoulder_L: ["Shoulder_L_1", "Shoulder_L_2"],
    Shoulder_R: ["Shoulder_R_1", "Shoulder_R_2"],

    Plackart: ["Plackart_1", "Plackart_2"],

    Cuirass: ["Cuirass_1", "Cuirass_2"],

    Arm_L: ["Arm_L_1", "Arm_L_2"],
    Arm_R: ["Arm_R_1", "Arm_R_2"],

    Belt: ["Belt_1", "Belt_2"],

    Thigh_L: ["Thigh_L_1", "Thigh_L_2"],
    Thigh_R: ["Thigh_R_1", "Thigh_R_2"],

    Calf_L: ["Calf_L_1", "Calf_L_2"],
    Calf_R: ["Calf_R_1", "Calf_R_2"],

    Shoe_R: null,
    Shoe_L: null,

    Glove_R: null,
    Glove_L: null,

    Glove_R_LED: null,
    Glove_L_LED: null,

    new: ["Eyes_LED"],
  },
  red: null,
};

const dancerType = {
  "1_chi": "yellow",
  "2_meow": "yellow",
  "3_yeee": "yellow",
  "4_breaKing": "yellow",
  "5_itzyboo": "yellow",
  "6_yu": "cyan",
  "7_wang": "cyan",
  "8_hao": "cyan",
  "9_monkey": "cyan",
  "10_dontstop": "cyan",
  "11_wish": "red",
};

const CONTROL = {};
Object.entries(originalControl).forEach(([frameKey, value]) => {
  const newStatus = {};
  Object.entries(value.status).forEach(([dancerName, dancerStatus]) => {
    const map = partmaps[dancerType[dancerName]];

    if (!map) {
      newStatus[dancerName] = _.cloneDeep(RED_STATUS);
      return;
    }

    newStatus[dancerName] = {};

    if ("new" in map) {
      map.new.forEach((newPart) => {
        const isLED = newPart.endsWith("_LED");
        newStatus[dancerName][newPart] = isLED
          ? { src: "", alpha: 0 }
          : { color: dancerType[dancerName], alpha: 0 };
      });
    }

    Object.entries(dancerStatus).forEach(([partName, partStatus]) => {
      if (partName in map) {
        const newName = map[partName];
        // if newName is null, delete the part
        if (!newName) return;
        else if (typeof newName === "string")
          newStatus[dancerName][newName] = { ...partStatus };
        else if (Array.isArray(newName))
          newName.forEach(
            (name) => (newStatus[dancerName][name] = { ...partStatus })
          );
      } else {
        newStatus[dancerName][partName] = { ...partStatus };
      }
    });
  });
  CONTROL[frameKey] = { ...value, status: newStatus };
});

const exportJSON = {
  position: originalPosition,
  control: CONTROL,
  dancer: DANCER,
  color: COLOR,
};

fs.writeFile(outputPath, JSON.stringify(exportJSON), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
