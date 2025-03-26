const oldData = require("./out/exportData.json");
const newData = require("../../utils/jsons/exportDataEmpty.json");

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
        // console.log(
        //   `LED length for ${modelName} ${oldPart.name} changed from ${oldPart.length} to ${newPart.length}`
        // );

        // LED Effects
        let modelPartEffects = oldData.LEDEffects[modelName][oldPart.name];

        if (oldPart.length < newPart.length) {
          // console.log("Old length is less than new length");

          Object.keys(modelPartEffects).forEach((effectName) => {
            let effect = modelPartEffects[effectName];
            // console.log(effectName);
            const lastLED =
              effect.frames[0].LEDs[effect.frames[0].LEDs.length - 1];
            effect.frames.forEach((frame) => {
              frame.LEDs = frame.LEDs.concat(
                Array(newPart.length - oldPart.length).fill(lastLED)
              );
            });
          });
        } else {
          // console.log("Old length is greater than new length");

          Object.keys(modelPartEffects).forEach((effectName) => {
            let effect = modelPartEffects[effectName];
            effect.frames.forEach((frame) => {
              frame.LEDs = frame.LEDs.slice(0, newPart.length);
            });
          });
        }

        // LED bulb data
        let dancerIndices = oldData.dancer.reduce((indices, dancer, index) => {
          if (dancer.model === modelName) {
            indices.push(index);
          }
          return indices;
        }, []);
        dancerIndices.forEach((dancerIndex) => {
          let partIndex = oldData.dancer[dancerIndex].parts.findIndex(
            (part) => part.name === oldPart.name
          );
          Object.values(oldData.control).forEach((controlFrame) => {
            oldLEDStatus = controlFrame.led_status[dancerIndex][partIndex];
            if (oldLEDStatus.length !== 0) {
              if (oldPart.length < newPart.length) {
                controlFrame.led_status[dancerIndex][partIndex] =
                  oldLEDStatus.concat(
                    Array(newPart.length - oldPart.length).fill(
                      oldLEDStatus[oldLEDStatus.length - 1]
                    )
                  );
              } else {
                controlFrame.led_status[dancerIndex][partIndex] =
                  oldLEDStatus.slice(0, newPart.length);
              }
            }
          });
        });

        oldPart.length = newPart.length;
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

console.log(JSON.stringify(modifiedData, null, 2));
