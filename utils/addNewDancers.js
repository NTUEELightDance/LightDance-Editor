const oldData = require("./out/exportData.json");
const newData = require("./jsons/exportDataEmpty.json");

const generateDefaultLocation = (dancerData) => {
  const length = dancerData.length;
  const spacing = 1;
  const pos = dancerData.map((val, index) => [
    -5,
    (index - (length - 1) / 2) * spacing,
    0,
  ]);
  return pos;
};

const merge = (
  oldData,
  newData,
  defaultLocation,
  defaultRotation,
  defaultColorData,
  defaultEffectData
) => {
  let mergedDancer = newData.dancer;
  let mergedPosition = oldData.position;
  let mergedControl = oldData.control;
  let mergedColor = oldData.color;
  let mergedLEDEffects = oldData.LEDEffects;

  // Create default position for new dancers
  Object.keys(mergedPosition).forEach((id) => {
    let positionFrame = oldData.position[id];
    let loc = positionFrame.location;
    for (let i = loc.length; i < mergedDancer.length; i++) {
      loc.push(defaultLocation[i]);
    }
    let rot = positionFrame.rotation;
    for (let i = rot.length; i < mergedDancer.length; i++) {
      rot.push(defaultRotation);
    }
  });

  // Create default status for new dancers
  Object.keys(mergedControl).forEach((id) => {
    let controlFrame = oldData.control[id];
    let status = controlFrame.status;
    let ledStatus = controlFrame.led_status;
    for (let i = status.length; i < mergedDancer.length; i++) {
      const dancerParts = mergedDancer[i].parts;
      let newStatus = [];
      dancerParts.forEach((part) => {
        if (part.type == "FIBER") {
          newStatus.push(defaultColorData);
        } else {
          newStatus.push(defaultEffectData);
        }
      });

      status.push(newStatus);
    }
    for (let i = ledStatus.length; i < mergedDancer.length; i++) {
      const dancerParts = mergedDancer[i].parts;
      let newLedStatus = [];
      dancerParts.forEach((part) => {
        if (part.type == "FIBER") {
          newLedStatus.push([]);
        } else {
          newLedStatus.push([]);
        }
      });
      ledStatus.push(newLedStatus);
    }
  });

  // Create default effects for new dancers
  newData.dancer.forEach((dancer) => {
    if (dancer.model in mergedLEDEffects) {
      return;
    }

    let dancerEffects = {};
    dancer.parts.forEach((part) => {
      let partEffects = {};
      if (part.type == "LED") {
        Object.keys(mergedColor).forEach((colorName) => {
          partEffects[colorName] = {
            repeat: 0,
            frames: [
              {
                LEDs: Array(part.length).fill([colorName, 255]),
                start: 0,
                fade: false,
              },
            ],
          };
        });

        dancerEffects[part.name] = partEffects;
      }
    });

    mergedLEDEffects[dancer.model] = dancerEffects;
  });

  return {
    dancer: mergedDancer,
    position: mergedPosition,
    control: mergedControl,
    color: mergedColor,
    LEDEffects: mergedLEDEffects,
  };
};

const defaultLocation = generateDefaultLocation(newData.dancer);
const defaultRotation = [0, 0, 0];
const defaultColorData = ["black", 0];
const defaultEffectData = ["black", 0];
const mergedData = merge(
  oldData,
  newData,
  defaultLocation,
  defaultRotation,
  defaultColorData,
  defaultEffectData
);

console.log(JSON.stringify(mergedData, null, 2));
