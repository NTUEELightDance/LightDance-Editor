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
  "11_wish": "magenta",
};

const groupedParts = {
  yellow: {},
  cyan: {
    Helmet: "Helmet_1",
    Shoulder_L: "Shoulder_L_1",
    Shoulder_R: "Shoulder_R_1",
    Plackart: "Plackart_1",
    Cuirass: "Cuirass_1",
    Arm_L: "Arm_L_1",
    Arm_R: "Arm_R_1",
    Belt: "Belt_1",
    Thigh_L: "Thigh_L_1",
    Thigh_R: "Thigh_R_1",
    Calf_L: "Calf_L_1",
    Calf_R: "Calf_R_1",
  },
  magenta: {
    Stomach: "Stomach_L",
    Mask: "Mask_1",
  },
};

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
  dancer: DANCER,
  color: COLOR,
} = JSON.parse(raw);

if (!("black" in COLOR)) COLOR.black = "#000000";

const CONTROL = {};
Object.entries(originalControl).forEach(([frameKey, value]) => {
  const newStatus = {};
  Object.entries(value.status).forEach(([dancerName, dancerStatus]) => {
    const map = groupedParts[dancerType[dancerName]];

    newStatus[dancerName] = {};
    Object.entries(dancerStatus).forEach(([partName, partStatus]) => {
      const nameList = partName.split("_");
      if (nameList.pop() !== "LED") {
        const groupedName = nameList.join("_");
        if (groupedName in map) {
          newStatus[dancerName][partName] = dancerStatus[map[groupedName]];
        } else {
          newStatus[dancerName][partName] = partStatus;
        }
      } else {
        newStatus[dancerName][partName] = partStatus;
      }

      if (
        newStatus[dancerName][partName].color &&
        !(newStatus[dancerName][partName].color in COLOR)
      ) {
        newStatus[dancerName][partName].color = "black";
      }

      if (
        newStatus[dancerName][partName].alpha &&
        newStatus[dancerName][partName].alpha <= 1
      )
        newStatus[dancerName][partName].alpha = 0;
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
