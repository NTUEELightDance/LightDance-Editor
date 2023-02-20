const fs = require("fs");
const path = require("path");
const { NodeIO } = require("@gltf-transform/core");

const COLOR = "black";
const COLOR_CODE = "#000000";
const NO_EFFECT = "";

const partNameIgnore = new Set(["Human"]);

const io = new NodeIO();

const modelPartNameCache = new Map();

async function getParts(modelPath) {
  if (modelPartNameCache.has(modelPath)) {
    return modelPartNameCache.get(modelPath);
  }

  const document = await io.read(modelPath); // → Document
  const root = document.getRoot();
  const names = root
    .listNodes()
    .map((node) => node.getName())
    // drop after '.'
    .map((name) => name.split(".")[0])
    // remove duplicates
    .filter((name, index, self) => self.indexOf(name) === index)
    // remove ignored names
    .filter((name) => !partNameIgnore.has(name));

  const parts = names.map((partName) => ({
    name: partName,
    type: partName.split("_").pop() === "LED" ? "LED" : "FIBER",
  }));

  modelPartNameCache.set(modelPath, parts);
  return parts;
}

const LEDPartLengthCache = new Map();

async function countLEDPartLength(modelPath) {
  const document = await io.read(modelPath); // → Document
  const root = document.getRoot();
  const LEDs = root
    .listNodes()
    .map((node) => node.getName())
    .filter((name) => name.includes("_LED."));

  const LEDcounter = LEDs.reduce((acc, LEDname) => {
    const partName = LEDname.split(".")[0];
    acc[partName] |= 0;
    acc[partName] += 1;
    return acc;
  }, {});

  // loop through the LEDcounter and compare the value with that in LEDPartLengthCache
  // if the value is different, use the longer one and update the cache
  for (const [partName, length] of Object.entries(LEDcounter)) {
    if (LEDPartLengthCache.has(partName)) {
      const cachedLength = LEDPartLengthCache.get(partName);
      if (length !== cachedLength) {
        console.warn(
          `LED part ${partName} has different length in different models: ${cachedLength} vs ${length}`
        );
      }
      if (length > cachedLength) {
        LEDPartLengthCache.set(partName, length);
      }
    } else {
      LEDPartLengthCache.set(partName, length);
    }
  }
}

function toGlbPath(dracoPath) {
  if (!dracoPath.endsWith(".draco.glb")) {
    throw new Error("not using draco glb in dancer map");
  }
  return dracoPath.replace(".draco.glb", ".glb");
}

function generateEmptyControlFrame(dancerData) {
  const status = dancerData.map(({ parts }) =>
    parts.map(({ type }) => {
      if (type === "LED") {
        return [NO_EFFECT, 0];
      } else if (type === "FIBER") {
        return [COLOR, 0];
      } else {
        throw new Error(`unknown type: ${type}`);
      }
    })
  );

  return {
    fade: false,
    start: 0,
    status,
  };
}

function generateEmptyPosMap(dancerData) {
  const length = dancerData.length;
  const spacing = 3;
  const pos = dancerData.map((val, index) => [
    (index - (length - 1) / 2) * spacing,
    0,
    0,
  ]);

  return {
    start: 0,
    pos,
  };
}

function generateDefaultEffect(length, color) {
  const LEDs = [];
  for (let i = 0; i < length; i++) {
    if (color.length !== 3 && color.length !== 4) {
      throw new Error("color should be an array of 3 or 4 numbers");
    }
    if (color.length === 3) {
      color.push(10);
    }
    LEDs.push(color);
  }
  return {
    repeat: 0,
    frames: [
      {
        start: 0,
        fade: false,
        LEDs,
      },
    ],
  };
}

function generateEmptyLEDEffects(dancerData) {
  const LEDparts = [];
  dancerData.forEach(({ parts }) => {
    parts.forEach(({ name, type }) => {
      if (type === "LED") {
        LEDparts.push(name);
      }
    });
  });

  const effects = LEDparts.reduce((acc, partName) => {
    const length = LEDPartLengthCache.get(partName);
    return {
      ...acc,
      [partName]: {
        all_black: generateDefaultEffect(length, [0, 0, 0, 0]),
        all_white: generateDefaultEffect(length, [255, 255, 255, 10]),
      },
    };
  }, {});

  return effects;
}

(async () => {
  const loadJsonPath = process.argv[2];
  const fileServerRoot = process.argv[3];

  // load the json file
  const loadJson = JSON.parse(fs.readFileSync(loadJsonPath, "utf8"));

  const dancerMap = loadJson["DancerMap"];

  // if dancerMap is not defined, throw an error
  if (!dancerMap) {
    throw new Error("DancerMap is not defined");
  }

  const dancerData = await Promise.all(
    Object.entries(dancerMap).map(async ([dancerName, { url }]) => {
      const modelUrl = toGlbPath(path.join(fileServerRoot, url));
      await countLEDPartLength(modelUrl);
      return {
        name: dancerName,
        parts: await getParts(modelUrl),
      };
    })
  );

  // sort by dancer name
  dancerData.sort(
    (a, b) => parseInt(a.name.split("_")[0]) - parseInt(b.name.split("_")[0])
  );

  const controlData = {
    0: generateEmptyControlFrame(dancerData),
  };

  const positionData = {
    0: generateEmptyPosMap(dancerData),
  };

  const colorData = {
    [COLOR]: COLOR_CODE,
  };

  const LEDEffectsData = generateEmptyLEDEffects(dancerData);

  const exportData = {
    dancer: dancerData,
    control: controlData,
    position: positionData,
    color: colorData,
    LEDEffects: LEDEffectsData,
  };

  console.log(JSON.stringify(exportData, null, 2));
})();
