/* eslint-disable camelcase */
/* eslint-disable no-console */
/**
 * Usage: node controlTransform.js <path_to_control.json> <output_path.json>
 */
const { ControlCameraSharp } = require("@material-ui/icons");
const fs = require("fs");
const { exit } = require("process");

const suit_good = [
  "G_BELT",
  "G_BODY",
  "G_L_ARM",
  "G_L_FOREARM",
  "G_L_LEG",
  "G_L_PANT",
  "G_L_SHOE",
  "G_MASK",
  "G_R_ARM",
  "G_R_FOREARM",
  "G_R_LEG",
  "G_R_PANT",
  "G_R_SHOE",
  "S_L_HAND",
  "S_R_HAND",
  "S_BELT",
  "S_COLLAR",
  "S_GLASSES",
  "S_HAT",
  "S_L_COAT",
  "S_L_PANT",
  "S_L_SHOE",
  "S_NECKTIE",
  "S_R_COAT",
  "S_R_PANT",
  "S_R_SHOE",
  "LED_L_SHOULDER",
  "LED_R_SHOULDER",
  "LED_NECKTIE",
  "LED_BELT",
  "LED_L_SHOE",
  "LED_R_SHOE",
];
const suit_bad = [
  "B_BELT",
  "B_BODY",
  "B_L_ARM",
  "B_L_FOREARM",
  "B_L_LEG",
  "B_L_PANT",
  "B_L_SHOE",
  "B_MASK",
  "B_R_ARM",
  "B_R_FOREARM",
  "B_R_LEG",
  "B_R_PANT",
  "B_R_SHOE",
  "S_L_HAND",
  "S_R_HAND",
  "S_BELT",
  "S_COLLAR",
  "S_GLASSES",
  "S_HAT",
  "S_L_COAT",
  "S_L_PANT",
  "S_L_SHOE",
  "S_NECKTIE",
  "S_R_COAT",
  "S_R_PANT",
  "S_R_SHOE",
  "LED_L_SHOULDER",
  "LED_R_SHOULDER",
  "LED_NECKTIE",
  "LED_BELT",
  "LED_L_SHOE",
  "LED_R_SHOE",
];
const good_bad = [
  "S_L_HAND",
  "S_R_HAND",
  "B_BELT",
  "B_BODY",
  "B_L_ARM",
  "B_L_FOREARM",
  "B_L_LEG",
  "B_L_PANT",
  "B_L_SHOE",
  "B_MASK",
  "B_R_ARM",
  "B_R_FOREARM",
  "B_R_LEG",
  "B_R_PANT",
  "B_R_SHOE",
  "G_BELT",
  "G_BODY",
  "G_L_ARM",
  "G_L_FOREARM",
  "G_L_LEG",
  "G_L_PANT",
  "G_L_SHOE",
  "G_MASK",
  "G_R_ARM",
  "G_R_FOREARM",
  "G_R_LEG",
  "G_R_PANT",
  "G_R_SHOE",
  "LED_L_SHOULDER",
  "LED_R_SHOULDER",
  "LED_NECKTIE",
  "LED_BELT",
  "LED_L_SHOE",
  "LED_R_SHOE",
];

const sword = {
  LED_HANDLE: { src: "bl_handle", alpha: 0 },
  LED_GUARD: { src: "bl_guard", alpha: 0 },
  LED_SWORD: { src: "bl_sword", alpha: 0 },
};

const dancersPart = {
  "1_191": suit_bad,
  "2_ke": suit_bad,
  "3_zhou": suit_bad,
  "4_kuang": suit_bad,
  "5_lin": suit_good,
  "6_liao": suit_good,
  "7_mon": suit_good,
  "8_fan": good_bad,
  "9_chia": good_bad,
  "10_lu": good_bad,
};

const swordsDancer = {
  "1_sw": sword,
  "2_sw": sword,
  "3_sw": sword,
  "4_sw": sword,
  "5_sw": sword,
  "6_sw": sword,
  "7_sw": sword,
  "8_sw": sword,
  "9_sw": sword,
  "10_sw": sword,
};

// Read Argument
const args = process.argv; // 0: node
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

// remove invalid part
const control = JSON.parse(raw);

control.map((c, idx) => {
  if (c) {
    const status = c.status;
    Object.entries(status).forEach(([dancerName, parts]) => {
      Object.keys(parts).forEach((partName) => {
        if (dancersPart[dancerName]) {
          if (!dancersPart[dancerName].includes(partName)) {
            console.log(`Delete ${dancerName} ${partName}`);
            delete parts[partName];
          }
        }
      });
    });
  } else {
    console.error(`[Error] frame ${idx} is null`);
  }
});

// fill missing  led parts
for (let i = 0; i < control.length; ++i) {
  Object.keys(swordsDancer).forEach((swordName) => {
    if (!(swordName in control[i].status)) {
      control[i].swordName = swordsDancer[swordName];
      console.log(`Filling LED Sword at frame ${i}`);
    }
  });
}

const newControl = [];
for (let i = 0; i < control.length; ++i) {
  if (control[i]) newControl.push(control[i]);
}

// Write File
fs.writeFile(outputPath, JSON.stringify(newControl), () => {
  console.log(`Writing new file to ... ${outputPath}`);
});
