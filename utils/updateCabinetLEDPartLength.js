const fs = require("fs");
const path = require("path");

main();

async function main() {
  const oldExportPath = process.argv[2];
  const oldExport = JSON.parse(fs.readFileSync(oldExportPath, "utf8"));

  const tmpFile = require("tmp").fileSync({ postfix: ".json" }).name;

  const cmdArguments = [
    "generateInitialExport.js",
    "../files/data/load.json",
    "../files/",
  ].map(cwd);

  // execute the command and redirect the output to the tmp file
  require("child_process").execFileSync(
    "node",
    cmdArguments,
    {
      stdio: ["ignore", fs.openSync(tmpFile, "w"), "ignore"],
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
  );

  // read the tmp file
  const referenceExport = JSON.parse(fs.readFileSync(tmpFile, "utf8"));

  const DANCERS = ["11_cabinet_ken", "12_cabinet_ttk", "13_cabinet_samuel"];

  const LED_PARTS = [
    "one_LED",
    "two_LED",
    "three_LED",
    "four_LED",
    "five_LED",
    "six_LED",
  ];

  const maxLengths = referenceExport.dancer
    .filter(({ name, parts }) => DANCERS.includes(name) && parts)
    .map(({ parts }) => parts)
    .flat()
    .filter(({ name }) => LED_PARTS.includes(name))
    .reduce(
      (acc, { name, length }) => ({
        ...acc,
        [name]: Math.max(acc[name] || 0, length),
      }),
      {}
    );

  const newDancerData = oldExport.dancer;
  newDancerData.forEach((dancer) => {
    if (!DANCERS.includes(dancer.name)) return;

    dancer.parts.forEach((part) => {
      if (!LED_PARTS.includes(part.name)) return;

      part.length = maxLengths[part.name];
    });
  });

  const newLEDEffects = oldExport.LEDEffects;
  for (const part of LED_PARTS) {
    for (const [effectName, effect] of Object.entries(newLEDEffects[part])) {
      let frames = effect.frames.map((frame) => {
        if (frame.LEDs.length > maxLengths[part]) {
          return {
            ...frame,
            LEDs: frame.LEDs.slice(0, maxLengths[part]),
          };
        } else if (frame.LEDs.length < maxLengths[part]) {
          return {
            ...frame,
            LEDs: [
              ...frame.LEDs,
              ...Array(maxLengths[part] - frame.LEDs.length)
                .fill()
                .map(() => ["black", 0]),
            ],
          };
        }
        return frame;
      });

      newLEDEffects[part][effectName] = {
        ...effect,
        frames,
      };
    }
  }
  // console.log(JSON.stringify(newLEDEffects["one_LED"], null, 2));
  // return;

  const newExport = {
    dancer: newDancerData,
    control: oldExport.control,
    position: oldExport.position,
    color: oldExport.color,
    LEDEffects: newLEDEffects,
  };

  console.log(JSON.stringify(newExport));
}

function cwd(relativePath) {
  if (!relativePath) return path.resolve(__dirname);

  if (relativePath.startsWith("/")) return relativePath;

  return path.resolve(__dirname, relativePath);
}
