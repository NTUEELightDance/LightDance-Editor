var crypto = require("crypto");
var fs = require("fs");
var path = require("path");

const filesRoot = process.argv[2];
const loadJsonPath = path.join(filesRoot, "/data/load.json");

const loadJson = require(loadJsonPath);

const createHash = (hashJson, loadJson, dataPaths) => {
  if (dataPaths.length === 1) {
    const dataPath = dataPaths[0];
    const filePath = loadJson[dataPath];
    if ((typeof filePath) !== "string") {
      throw new Error("Invalid data path");
    }

    const fileFullPath = path.join(filesRoot, filePath);
    const file = fs.readFileSync(fileFullPath);

    var hashFunc = crypto.createHash("sha256");
    hashFunc.setEncoding("hex");

    hashFunc.write(file);
    hashFunc.end();

    const hash = hashFunc.read();
    hashJson[dataPath] = hash;

    return;
  }

  const dataPath = dataPaths[0];

  if (dataPath !== "*") {
    let subHashJson = {};
    const subLoadJson = loadJson[dataPath];
    if ((typeof subLoadJson) !== "object") {
      throw new Error("Invalid data path");
    }

    createHash(subHashJson, subLoadJson, dataPaths.slice(1));
    hashJson[dataPath] = subHashJson;
  } else {
    for (let key of Object.keys(loadJson)) {
      let subHashJson = {};
      const subLoadJson = loadJson[key];
      if ((typeof subLoadJson) !== "object") {
        throw new Error("Invalid data path");
      }

      createHash(subHashJson, subLoadJson, dataPaths.slice(1));
      hashJson[key] = subHashJson;
    }
  }
};

let hashJson = {};
createHash(hashJson, loadJson, ["Beat"])
createHash(hashJson, loadJson, ["Music"]);
createHash(hashJson, loadJson, ["Waveform"]);
createHash(hashJson, loadJson, ["LightPresets"]);
createHash(hashJson, loadJson, ["PosPresets"]);
createHash(hashJson, loadJson, ["DancerMap", "*", "url"]);

console.log(JSON.stringify(hashJson, null, 2));
