const fs = require("fs");
const { exit } = require("process");
const { cloneDeep } = require("lodash");

// Read Argument
const args = process.argv;
if (args.length < 4) {
  console.error(`[Error] Invalid Arguments !!!`);
  exit();
}

const exportDataPath = args[2];
const LEDDataPAth = args[3];
const exportOutputPath = args[4];
const LEDOutputPath = args[5];

// get input file
console.log("Reading json from ... ", exportDataPath);
let exportRaw = null;
try {
  exportRaw = fs.readFileSync(exportDataPath);
} catch (err) {
  console.error(`[Error] Can't open file ${exportDataPath}`);
  exit();
}

console.log("Reading json from ... ", LEDDataPAth);
let ledRaw = null;
try {
  ledRaw = fs.readFileSync(LEDDataPAth);
} catch (err) {
  console.error(`[Error] Can't open file ${LEDDataPAth}`);
  exit();
}

let dancerConfig = null;
try {
  dancerConfig = fs.readFileSync('data/1_henning.json');
} catch (err) {
  console.error(`[Error] Can't open file ${'data/1_henning.json'}`);
  exit();
}

const {
  LEDPARTS: ledConfig,
} = JSON.parse(dancerConfig)
const LEDeffects = JSON.parse(ledRaw)

const newLEDeffects = {}
Object.keys(LEDeffects).forEach(partName => newLEDeffects[partName] = partName.startsWith('Hand') ? LEDeffects[partName] : {})

const {
  position: originalPosition,
  control: originalControl,
  dancer: DANCER,
  color: COLOR,
} = JSON.parse(exportRaw);

const getLEDeffectName = (partName, color) => {
  if (!(color in COLOR)) {
    color = "black"
  }

  const { len } = ledConfig[partName];
  const effectName = `${color}_${len}`;

  return effectName
}

const generateLEDeffect = (partName, color) => {
  if (!(color in COLOR)) {
    color = "black"
  }

  const { len } = ledConfig[partName];
  const effectName = `${color}_${len}`;

  const effect = [];

  for (let i = 0; i < len; i++) {
    effect.push({
      alpha: 10,
      colorCode: COLOR[color]
    })
  }

  newLEDeffects[partName][effectName] = {
    repeat: 0,
    effects: [
      {
        effect,
        start: 0,
        fade: false
      }
    ]
  }

  return effectName;
}

['Shoe_L_LED', 'Shoe_R_LED'].forEach(
  (partName) => {
    const partEffects = LEDeffects[partName]

    Object.keys(partEffects).forEach(
      (effectName) => {
        generateLEDeffect(partName, effectName.replace('_37', ''))
      }
    )

  }
)

const CONTROL = {};
Object.entries(originalControl).forEach(([frameKey, value]) => {
  const newStatus = {};

  Object.entries(value.status).forEach(([dancerName, dancerStatus]) => {

    newStatus[dancerName] = {};

    Object.entries(dancerStatus).forEach(([partName, partStatus]) => {

      newStatus[dancerName][partName] = partStatus;

      if (partName.startsWith('Shoe') && partName.endsWith('LED')) {
        newStatus[dancerName][partName].src = partStatus.src.replace('_37', '_80')
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

fs.writeFile(exportOutputPath, JSON.stringify(exportJSON), () => {
  console.log(`written new file to ... ${exportOutputPath}`);
});

fs.writeFile(LEDOutputPath, JSON.stringify(newLEDeffects), () => {
  console.log(`written new file to ... ${LEDOutputPath}`);
})