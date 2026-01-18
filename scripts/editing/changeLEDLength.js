/*
 * This script updates LED lengths across dancers and adjusts LED effects and status accordingly.
 * If a dancer model's LED length changes, all related LED effects and control data are updated.
 */

const fs = require("fs");
const path = require("path");

const buildModelMap = (dancers) => {
    return dancers.reduce((acc, dancer) => {
        if (!(dancer.model in acc)) {
            acc[dancer.model] = dancer.parts;
        }
        return acc;
    }, {});
};

const updateLEDEffects = (effects, oldLength, newLength, lastLED) => {
    Object.values(effects).forEach((effect) => {
        effect.frames.forEach((frame) => {
            if (oldLength < newLength) {
                // Extend with last LED
                frame.LEDs = frame.LEDs.concat(
                    Array(newLength - oldLength).fill(lastLED)
                );
            } else {
                // Truncate to new length
                frame.LEDs = frame.LEDs.slice(0, newLength);
            }
        });
    });
};

const updateLEDStatus = (ledStatus, oldLength, newLength) => {
    if (ledStatus.length === 0) return;

    const lastStatus = ledStatus[ledStatus.length - 1];

    if (oldLength < newLength) {
        // Extend with last status
        return ledStatus.concat(
            Array(newLength - oldLength).fill(lastStatus)
        );
    } else {
        // Truncate to new length
        return ledStatus.slice(0, newLength);
    }
};

const changeLEDLength = (oldData, newData) => {
    const oldModelMap = buildModelMap(oldData.dancer);
    const newModelMap = buildModelMap(newData.dancer);

    // Process each model
    Object.entries(newModelMap).forEach(([modelName, newParts]) => {
        if (!(modelName in oldModelMap)) {
            console.warn(`⚠ Model "${modelName}" not found in old data`);
            return;
        }

        const oldParts = oldModelMap[modelName];

        // Process each part
        oldParts.forEach((oldPart, partIndex) => {
            const newPart = newParts[partIndex];

            // Only process LED parts with length changes
            if (oldPart.type !== "LED" || oldPart.length === newPart.length) {
                return;
            }

            // Get last LED for extending
            const modelPartEffects = oldData.LEDEffects[modelName]?.[oldPart.name];
            if (!modelPartEffects) {
                console.warn(`⚠ LED effects for ${modelName}.${oldPart.name} not found`);
                return;
            }

            const lastLED = modelPartEffects[Object.keys(modelPartEffects)[0]]?.frames[0]?.LEDs[oldPart.length - 1];

            // Update LED effects
            updateLEDEffects(modelPartEffects, oldPart.length, newPart.length, lastLED);

            // Update LED status in control frames
            const dancerIndices = oldData.dancer.reduce((indices, dancer, index) => {
                if (dancer.model === modelName) {
                    indices.push(index);
                }
                return indices;
            }, []);

            dancerIndices.forEach((dancerIndex) => {
                const partIdx = oldData.dancer[dancerIndex].parts.findIndex(
                    (part) => part.name === oldPart.name
                );

                Object.values(oldData.control).forEach((controlFrame) => {
                    const oldLEDStatus = controlFrame.led_status[dancerIndex][partIdx];
                    controlFrame.led_status[dancerIndex][partIdx] = updateLEDStatus(
                        oldLEDStatus,
                        oldPart.length,
                        newPart.length
                    );
                });
            });

            // Update part length
            oldPart.length = newPart.length;
        });
    });

    return oldData;
};

// Main execution
if (require.main === module) {
    try {
        const oldDataPath = path.join(__dirname, "./out/exportData.json");
        const newDataPath = path.join(__dirname, "../../utils/jsons/exportDataEmpty.json");

        if (!fs.existsSync(oldDataPath)) {
            throw new Error(`Old data file not found: ${oldDataPath}`);
        }
        if (!fs.existsSync(newDataPath)) {
            throw new Error(`New data file not found: ${newDataPath}`);
        }

        const oldData = JSON.parse(fs.readFileSync(oldDataPath, "utf-8"));
        const newData = JSON.parse(fs.readFileSync(newDataPath, "utf-8"));

        const modifiedData = changeLEDLength(oldData, newData);

        const outputPath = path.join(__dirname, "./out/exportData_ledLength_updated.json");
        fs.writeFileSync(outputPath, JSON.stringify(modifiedData, null, 2));
        console.log(`✓ LED lengths updated and saved to ${outputPath}`);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

module.exports = { changeLEDLength, buildModelMap, updateLEDEffects, updateLEDStatus };

// const oldData = require("./out/exportData.json");
// const newData = require("../../utils/jsons/exportDataEmpty.json");

// const zip = (a, b) => a.map((k, i) => [k, b[i]]);

// const main = (oldData, newData) => {
//   const oldModelMap = oldData.dancer.reduce((acc, dancer) => {
//     if (!(dancer.model in acc)) {
//       acc[dancer.model] = dancer.parts;
//     }
//     return acc;
//   }, {});

//   const newModelMap = newData.dancer.reduce((acc, dancer) => {
//     if (!(dancer.model in acc)) {
//       acc[dancer.model] = dancer.parts;
//     }
//     return acc;
//   }, {});

//   Object.keys(newModelMap).forEach((modelName) => {
//     if (!(modelName in oldModelMap)) {
//       console.log(modelName, "not found in new data");
//       return;
//     }

//     const oldDancerParts = oldModelMap[modelName];
//     const newDancerParts = newModelMap[modelName];

//     zip(oldDancerParts, newDancerParts).forEach(([oldPart, newPart]) => {
//       if (oldPart.type !== "LED") {
//         return;
//       }

//       if (oldPart.length !== newPart.length) {
//         // console.log(
//         //   `LED length for ${modelName} ${oldPart.name} changed from ${oldPart.length} to ${newPart.length}`
//         // );

//         // LED Effects
//         let modelPartEffects = oldData.LEDEffects[modelName][oldPart.name];

//         if (oldPart.length < newPart.length) {
//           // console.log("Old length is less than new length");

//           Object.keys(modelPartEffects).forEach((effectName) => {
//             let effect = modelPartEffects[effectName];
//             // console.log(effectName);
//             const lastLED =
//               effect.frames[0].LEDs[effect.frames[0].LEDs.length - 1];
//             effect.frames.forEach((frame) => {
//               frame.LEDs = frame.LEDs.concat(
//                 Array(newPart.length - oldPart.length).fill(lastLED)
//               );
//             });
//           });
//         } else {
//           // console.log("Old length is greater than new length");

//           Object.keys(modelPartEffects).forEach((effectName) => {
//             let effect = modelPartEffects[effectName];
//             effect.frames.forEach((frame) => {
//               frame.LEDs = frame.LEDs.slice(0, newPart.length);
//             });
//           });
//         }

//         // LED bulb data
//         let dancerIndices = oldData.dancer.reduce((indices, dancer, index) => {
//           if (dancer.model === modelName) {
//             indices.push(index);
//           }
//           return indices;
//         }, []);
//         dancerIndices.forEach((dancerIndex) => {
//           let partIndex = oldData.dancer[dancerIndex].parts.findIndex(
//             (part) => part.name === oldPart.name
//           );
//           Object.values(oldData.control).forEach((controlFrame) => {
//             oldLEDStatus = controlFrame.led_status[dancerIndex][partIndex];
//             if (oldLEDStatus.length !== 0) {
//               if (oldPart.length < newPart.length) {
//                 controlFrame.led_status[dancerIndex][partIndex] =
//                   oldLEDStatus.concat(
//                     Array(newPart.length - oldPart.length).fill(
//                       oldLEDStatus[oldLEDStatus.length - 1]
//                     )
//                   );
//               } else {
//                 controlFrame.led_status[dancerIndex][partIndex] =
//                   oldLEDStatus.slice(0, newPart.length);
//               }
//             }
//           });
//         });

//         oldPart.length = newPart.length;
//       }
//     });
//   });

//   oldData.dancer.forEach((oldDancer) => {
//     const modelName = oldDancer.model;
//     oldDancer.parts = oldModelMap[modelName];
//   });

//   return oldData;
// };

// const modifiedData = main(oldData, newData);

// console.log(JSON.stringify(modifiedData, null, 2));
