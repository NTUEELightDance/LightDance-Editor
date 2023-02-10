const fs = require("fs");
const path = require("path");
const { NodeIO } = require("@gltf-transform/core");

const COLOR = "black";
const COLOR_CODE = "#000000";

const partNameIgnore = new Set(["Human"]);

const io = new NodeIO();

const extractCache = new Map();

async function getParts(input) {
  if (extractCache.has(input)) {
    return extractCache.get(input);
  }

  const document = await io.read(input); // → Document
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

  extractCache.set(input, parts);
  return parts;
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
        throw new Error("LED not implemented yet");
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

function generateEmptyLEDEffects(dancerData) {
  const LEDparts = [];
  dancerData.forEach(({ parts }) => {
    parts.forEach(({ name, type }) => {
      if (type === "LED") {
        LEDparts.push(name);
      }
    });
  });

  const effects = LEDparts.reduce(
    (acc, partName) => ({
      ...acc,
      [partName]: {},
    }),
    {}
  );

  return effects;
}

const loadJsonPath = process.argv[2];
const fileServerRoot = process.argv[3];

// load the json file
const loadJson = JSON.parse(fs.readFileSync(loadJsonPath, "utf8"));

const dancerMap = loadJson["DancerMap"];

(async () => {
  // if dancerMap is not defined, throw an error
  if (!dancerMap) {
    throw new Error("DancerMap is not defined");
  }

  const dancerData = await Promise.all(
    Object.entries(dancerMap).map(async ([dancerName, { url }]) => {
      const modelUrl = toGlbPath(path.join(fileServerRoot, url));
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
