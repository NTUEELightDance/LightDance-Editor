const oldData = require("./out/exportData.json");
const newData = require("./jsons/exportDataEmpty.json");

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

const main = (oldData, newData) => {
  const oldModelMap = oldData.dancer.reduce((acc, dancer) => {
    if (!(dancer.model in acc)) {
      acc[dancer.model] = dancer.parts;
    }
    return acc;
  }, {});

  const newModelMap = newData.dancer.reduce((acc, dancer) => {
    if (!(dancer.model in acc)) {
      acc[dancer.model] = dancer.parts;
    }
    return acc;
  }, {});

  Object.keys(newModelMap).forEach((modelName) => {
    if (!(modelName in oldModelMap)) {
      console.log(modelName, "not found in new data");
      return;
    }

    const oldDancerParts = oldModelMap[modelName];
    const newDancerParts = newModelMap[modelName];

    zip(oldDancerParts, newDancerParts).forEach(([oldPart, newPart]) => {
      if (oldPart.type !== "LED") {
        return;
      }

      if (oldPart.length !== newPart.length) {
        console.log(
          `LED length for ${modelName} ${oldPart.name} changed from ${oldPart.length} to ${newPart.length}`
        );

        oldPart.length = newPart.length;

        let modelPartEffects = oldData.LEDEffects[modelName][oldPart.name];

        if (oldPart.length < newPart.length) {
          console.log("Old length is less than new length");

          Object.keys(modelPartEffects).forEach((effectName) => {
            let effect = modelPartEffects[effectName];
            const lastLED = effect.frames[0].LEDs[effect.frames[0].LEDs.length - 1];
            effect.frames.forEach((frame) => {
              frame.LEDs = frame.LEDs.concat(
                Array(newPart.length - oldPart.length).fill(lastLED)
              );
            });
          });
        } else {
          console.log("Old length is greater than new length");

          Object.keys(modelPartEffects).forEach((effectName) => {
            let effect = modelPartEffects[effectName];
            effect.frames.forEach((frame) => {
              frame.LEDs = frame.LEDs.slice(0, newPart.length);
            });
          });
        }
      }
    });
  });

  oldData.dancer.forEach((oldDancer) => {
    const modelName = oldDancer.model;
    oldDancer.parts = oldModelMap[modelName];
  });

  return oldData;
};

const modifiedData = main(oldData, newData);

// console.log(JSON.stringify(modifiedData, null, 2));
