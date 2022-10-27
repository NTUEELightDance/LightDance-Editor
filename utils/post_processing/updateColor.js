const dancerType = {
  "1_henning": "yellow",
  "2_hans": "yellow",
};

const requiredColor = {
  "1_l_blue": null,
  "1_d_blue": null,
  "c_2_yellow": null,
  "z_1_green": null,
  "black": null,
  "2_d_purple": "#3300ff",
  "2_l_purple": "#ff00d6",
  "2_big_red": "#ff0001",
  "y_orange": "#ff2200",
}

const newColorMap = {
  "p_1_red": "2_big_red",
  "yellow": "c_2_yellow",
  "z_2_white": "c_2_yellow",
  "p_1_white": "c_2_yellow",
  "c_1_pink": "y_orange",
  "orange": "y_orange",
}

const fs = require("fs");
const { exit } = require("process");

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
  OFPARTS: ofParts,
} = JSON.parse(dancerConfig)
const LEDeffects = JSON.parse(ledRaw)

const newLEDEffect = {}
Object.keys(LEDeffects).forEach(partName => newLEDEffect[partName] = {})

const {
  position: originalPosition,
  control: originalControl,
  dancer: DANCER,
  color: COLOR,
} = JSON.parse(exportRaw);

COLOR.black = "#000000";

Object.entries(COLOR).forEach(
  ([colorName, colorCode]) => {
    if (!(colorName in requiredColor)) {
      delete COLOR[colorName]
    } else if (requiredColor[colorName] !== null) {
      COLOR[colorName] = requiredColor[colorName]
    }
  }
)

const getLEDeffectName = (partName, color) => {
  if (!(color in COLOR)) {
    color = "black"
  }

  const { len } = ledConfig[partName];
  const effectName = `${color}_${len}`;

  return effectName
}

const generateLEDeffect = (partName, color) => {
  if (color === 'end') {
    color = "black"
  }
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

  newLEDEffect[partName][effectName] = {
    repeat: color === 'end' ? 1 : 0,
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

Object.entries(COLOR).forEach(
  ([colorName, colorCode]) => {
    Object.keys(ledConfig).forEach(
      (partName) => {
        generateLEDeffect(
          partName,
          colorName
        )
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

      if (partName.endsWith('LED')) {
        if (!(partName in ledConfig))
          partStatus.src = ''
        else
          if (LEDeffects[partStatus.src]) {
            newLEDEffect[partStatus.src] = LEDeffects[partStatus.src]
          } else {
            partStatus.src = getLEDeffectName(partName, 'black')
          }
      } else {
        if (!(partStatus.color in COLOR)) {
          newStatus[dancerName][partName].color = newColorMap[partStatus.color] ?? 'black'
        }
      }

      if (
        newStatus[dancerName][partName].color &&
        !(newStatus[dancerName][partName].color in COLOR)
      ) {
        newStatus[dancerName][partName].color = "black";
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

fs.writeFile(LEDOutputPath, JSON.stringify(newLEDEffect), () => {
  console.log(`written new file to ... ${LEDOutputPath}`);
})