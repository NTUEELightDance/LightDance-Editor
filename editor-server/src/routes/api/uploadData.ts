import { Request, Response } from "express";

import prisma from "../../prisma";
import { initRedisControl, initRedisPosition } from "../../utility";
import {
  TDancerData,
  TExportData,
  TPartData,
  TELControl,
  TLEDControl,
  TFiberControl,
  TExportLEDFrame,
  TExportLEDFrameLED,
  TPositionPos,
  TColorIdPair,
  TLEDIdPair,
  TPartLEDPair,
} from "../../types/global";
import { isArray } from "class-validator";
import { Prisma } from "@prisma/client";

type DancerTmpData = {
  [key: string]: {
    id: number;
    parts: PartTmpData;
    partsList: string[];
  };
};
type PartTmpData = {
  [key: string]: {
    type: "LED" | "FIBER";
    id: number;
  };
};
type CtrlFrameTmpData = {
  fade: boolean;
  start: number;
  status: (TELControl | TLEDControl | TFiberControl)[][];
};
type PosFrameTmpData = {
  start: number;
  pos: TPositionPos[];
};
type PartsListTmpData = {
  // key: dancer name
  [key: string]: TPartData[];
};

const uploadData = async (req: Request, res: Response) => {
  try {
    // read request
    const data = Array.isArray(req.files!.data)
      ? req.files!.data[0]
      : req.files!.data;
    const dataObj: TExportData = JSON.parse(data.data.toString("ascii"));
    const { position, control, dancer, color, LEDEffects } = dataObj;

    // save dancer data temporarily (including part data)
    const allDancer: DancerTmpData = {};
    const allPartsList: PartsListTmpData = {};

    // set of fiberColors & LEDPartNames
    const allFiberColors = new Set<string | number>();

    const error: string[] = [];

    // check all data are valid
    // check main type
    if (!isArray(dancer))
      error.push(
        "DANCER_DATA_ERROR: Dancer has incorrect type. Expected type array."
      );
    if (typeof position !== "object")
      error.push(
        "POSITIONFRAME_DATA_ERROR: Position has incorrect type. Expected type object."
      );
    if (typeof control !== "object")
      error.push(
        "CTRLFRAME_DATA_ERROR: Control has incorrect type. Expected type object."
      );
    if (typeof color !== "object")
      error.push(
        "COLOR_DATA_ERROR: Color has incorrect type. Expected type object."
      );
    if (typeof LEDEffects !== "object")
      error.push(
        "LEDEFFECT_DATA_ERROR: LEDEffect has incorrect type. Expected type object."
      );
    if (error.length > 0) {
      res.status(400).send({ error: error });
      return;
    }

    // check color data type & add fiber color list
    Object.keys(color).forEach((colorKey: string) => {
      allFiberColors.add(colorKey);
      if (!isArray(color[colorKey])) {
        error.push(
          `COLOR_DATA_ERROR: Color ${colorKey}'s value type is ${typeof color[
            colorKey
          ]}, while array expected.`
        );
        return;
      }
      if (color[colorKey].length !== 3) {
        error.push(
          `COLOR_DATA_ERROR: Color ${colorKey}'s value length is ${color[colorKey].length}, while 3 expected.`
        );
        return;
      }
      if (
        typeof color[colorKey][0] !== "number" ||
        typeof color[colorKey][1] !== "number" ||
        typeof color[colorKey][2] !== "number"
      ) {
        error.push(
          `COLOR_DATA_ERROR: Color ${colorKey}'s value type is incorrect, expected 3 number.`
        );
      }
    });

    // check dancer data type
    dancer.forEach((dancerObj: TDancerData, dancerIdx) => {
      const { parts, name } = dancerObj;
      if (typeof name !== "string")
        error.push(
          `DANCER_DATA_ERROR: Dancer idx ${dancerIdx} has incorrect "name" type. Expected type string, but received ${typeof name}.`
        );
      if (!isArray(parts)) {
        error.push(
          `DANCER_DATA_ERROR: Dancer idx ${dancerIdx} has incorrect "parts" type. Expected type array`
        );
        return;
      }
      allPartsList[name] = parts.map((partObj: TPartData, partIdx) => {
        const { name, type, length } = partObj;
        if (typeof name !== "string")
          error.push(
            `DANCER_DATA_ERROR: Dancer idx ${dancerIdx}, part idx ${partIdx} has incorrect "name" type. Expected type string, but received ${typeof name}.`
          );
        if (typeof type !== "string")
          error.push(
            `DANCER_DATA_ERROR: Dancer idx ${dancerIdx}, part idx ${partIdx} has incorrect "type" type. Expected type string, but received ${typeof type}.`
          );
        if (type === "LED" && (typeof length !== "number" || length < 0))
          error.push(
            `DANCER_DATA_ERROR: Dancer idx ${dancerIdx}, LED part idx ${partIdx} has incorrect length data. Expected positive number, but received ${length}.`
          );
        return partObj;
      });
    });

    // check LEDEffect data type
    Object.keys(LEDEffects).forEach((partName: string) => {
      const effectData = LEDEffects[partName];
      Object.keys(effectData).forEach((effectName: string) => {
        const { frames, repeat } = effectData[effectName];
        if (typeof repeat !== "number")
          error.push(
            `LEDEFFECT_DATA_ERROR: LEDEffect name ${effectName} has incorrect "repeat" type. Expected type number, but received ${typeof repeat}`
          );
        if (!isArray(frames)) {
          error.push(
            `LEDEFFECT_DATA_ERROR: LEDEffect name ${effectName} has incorrect "frames" type. Expected type array`
          );
          return;
        }
        frames.forEach((frame: TExportLEDFrame, frameIdx) => {
          const { LEDs, start, fade } = frame;
          if (typeof start !== "number")
            error.push(
              `LEDEFFECT_DATA_ERROR: LEDEffect name ${effectName}, frames idx ${frameIdx} has incorrect "start" type. Expected type number, but received ${typeof start}`
            );
          if (typeof fade !== "boolean")
            error.push(
              `LEDEFFECT_DATA_ERROR: LEDEffect name ${effectName}, frames idx ${frameIdx} has incorrect "fade type. Expected type boolean, but received ${typeof fade}`
            );
          if (!isArray(LEDs)) {
            error.push(
              `LEDEFFECT_DATA_ERROR: LEDEffect name ${effectName}, frames idx ${frameIdx} has incorrect "LEDs" type. Expected type array`
            );
            return;
          }
          LEDs.forEach((LED: TExportLEDFrameLED, LEDIdx) => {
            if (!isArray(LED)) {
              error.push(
                `LEDEFFECT_DATA_ERROR: LEDEffect name ${effectName}, frames idx ${frameIdx}, LEDs idx ${LEDIdx} has incorrect type. Expected type array`
              );
              return;
            }
            if (LED.length !== 2) {
              error.push(
                `LEDEFFECT_DATA_ERROR: LEDEffect name ${effectName}, frames idx ${frameIdx}, LEDs idx ${LEDIdx} has incorrect shape. Expected 4 number, but received ${LED.length}.`
              );
              return;
            }
            if (typeof LED[0] !== "string" || !allFiberColors.has(LED[0])) {
              error.push(
                `LEDEFFECT_DATA_ERROR: LEDEffect name ${effectName}, frames idx ${frameIdx}, LEDs idx ${LEDIdx} has unknown colorName ${LED[0]}.`
              );
              return;
            }
            if (typeof LED[1] !== "number") {
              error.push(
                `LEDEFFECT_DATA_ERROR: LEDEffect name ${effectName}, frames idx ${frameIdx}, LEDs idx ${LEDIdx} has incorrect data type at index 2. Expected number`
              );
            }
          });
        });
      });
    });
    if (error.length > 0) {
      res.status(400).send({ error: error });
      return;
    }

    // check every position frame has the same number of real dancers
    Object.keys(position).forEach((frameId: string) => {
      const frameObj: PosFrameTmpData = position[frameId];
      const { start, pos } = frameObj;
      if (typeof start !== "number")
        error.push(
          `POSITIONFRAME_DATA_ERROR: Position frameID ${frameId} has incorrect "start" type. Expected type number, but received ${typeof start}`
        );
      if (!isArray(pos)) {
        error.push(
          `POSITIONFRAME_DATA_ERROR: Position frameID ${frameId} has incorrect "pos" type. Expected type array`
        );
        return;
      }
      if (pos.length !== Object.keys(allPartsList).length)
        error.push(
          `POSITIONFRAME_DATA_ERROR: Position frameID ${frameId} has invalid number of dancers. Found ${
            pos.length
          }, Expected ${Object.keys(allPartsList).length}`
        );
      pos.forEach((dancerPos, posIdx) => {
        if (!isArray(dancerPos)) {
          error.push(
            `POSITIONFRAME_DATA_ERROR: Position frameID ${frameId}, pos idx ${posIdx} has incorrect type. Expected type array`
          );
          return;
        }
        if (dancerPos.length !== 3) {
          error.push(
            `POSITIONFRAME_DATA_ERROR: Position frameID ${frameId}, pos idx ${posIdx} has incorrect shape. Expected 3 numbers, but received ${dancerPos.length}.`
          );
          return;
        }
        if (
          typeof dancerPos[0] !== "number" ||
          typeof dancerPos[1] !== "number" ||
          typeof dancerPos[2] !== "number"
        ) {
          error.push(
            `POSITIONFRAME_DATA_ERROR: Position frameID ${frameId}, pos idx ${posIdx} has incorrect type. Expected 3 numbers`
          );
        }
      });
    });

    // check every dancer in every control frame has the same number of real parts
    Object.keys(control).map((frameId: string) => {
      const frameObj: CtrlFrameTmpData = control[frameId];
      const { fade, start, status } = frameObj;
      if (typeof start !== "number")
        error.push(
          `CTRLFRAME_DATA_ERROR: Control frameID ${frameId} has incorrect "start" type. Expected type number, but received ${typeof start}`
        );
      if (typeof fade !== "boolean")
        error.push(
          `CTRLFRAME_DATA_ERROR: Control frameID ${frameId} has incorrect "fade" type. Expected type boolean, but received ${typeof fade}`
        );
      if (!isArray(status)) {
        error.push(
          `CTRLFRAME_DATA_ERROR: Control frameID ${frameId} has incorrect "status" type. Expected type array`
        );
        return;
      }
      if (status.length !== Object.keys(allPartsList).length)
        error.push(
          `CTRLFRAME_DATA_ERROR: Control frame starting at ${start}ms has invalid number of dancers. Found ${
            status.length
          }, Expected ${Object.keys(allPartsList).length}`
        );
      status.forEach(
        (
          dancerStatus: (TELControl | TLEDControl | TFiberControl)[],
          dancerIdx
        ) => {
          if (!isArray(dancerStatus)) {
            error.push(
              `CTRLFRAME_DATA_ERROR: Control frameID ${frameId}, status idx ${dancerIdx} has incorrect type. Expected type array`
            );
            return;
          }
          if (
            dancerStatus.length !==
            Object.values(allPartsList[Object.keys(allPartsList)[dancerIdx]])
              .length
          ) {
            error.push(
              `CTRLFRAME_DATA_ERROR: Control frameID ${frameId}, status idx ${dancerIdx} has invalid number of parts. Found ${
                dancerStatus.length
              }, Expected ${
                Object.values(
                  allPartsList[Object.keys(allPartsList)[dancerIdx]]
                ).length
              }`
            );
            return;
          }

          // validate status data & fiber color
          dancerStatus.forEach(
            (partStatus: TELControl | TLEDControl | TFiberControl, partIdx) => {
              const tmpPart = dancer[dancerIdx].parts[partIdx];
              if (!isArray(partStatus)) {
                error.push(
                  `CTRLFRAME_DATA_ERROR: Control frameID ${frameId}, status idx ${dancerIdx}, part Idx ${partIdx} has incorrect type. Expected type array`
                );
                return;
              }
              if (partStatus.length != 2) {
                error.push(
                  `CTRLFRAME_DATA_ERROR: Control frameID ${frameId}, status idx ${dancerIdx}, part Idx ${partIdx} has incorrect length. Expected 2, nut received ${partStatus.length}`
                );
                return;
              }
              if (tmpPart.type === "FIBER") {
                if (typeof partStatus[0] !== "string") {
                  error.push(
                    `CTRLFRAME_DATA_ERROR: Control frameID ${frameId}, status idx ${dancerIdx}, part idx ${partIdx} has invalid Fiber color type!! Expected string, but received ${typeof partStatus[0]}`
                  );
                }
                if (partStatus && !allFiberColors.has(partStatus[0])) {
                  error.push(
                    `CTRLFRAME_DATA_ERROR: Fiber color '${partStatus[0]}' not found!!`
                  );
                }
                if (typeof partStatus[1] !== "number") {
                  error.push(
                    `CTRLFRAME_DATA_ERROR: Control frameID ${frameId}, status idx ${dancerIdx}, part idx ${partIdx} has invalid Fiber alpha type!! Expected number, but received ${typeof partStatus[1]}`
                  );
                }
              } else if (tmpPart.type === "LED") {
                if (typeof partStatus[0] !== "string") {
                  error.push(
                    `CTRLFRAME_DATA_ERROR: Control frameID ${frameId}, status idx ${dancerIdx}, part idx ${partIdx} has invalid LED src type!! Expected string, but received ${typeof partStatus[0]}`
                  );
                }
                if (
                  partStatus[0] &&
                  !Object.keys(LEDEffects[tmpPart.name]).includes(partStatus[0])
                ) {
                  error.push(
                    `CTRLFRAME_DATA_ERROR: LED src '${partStatus[0]}' not found!!`
                  );
                }
                if (typeof partStatus[1] !== "number") {
                  error.push(
                    `CTRLFRAME_DATA_ERROR:Control frameID ${frameId}, status idx ${dancerIdx}, part idx ${partIdx} has invalid LED alpha type!! Expected number, but received ${typeof partStatus[1]}`
                  );
                }
              }
            }
          );
        }
      );
    });
    if (error.length > 0) {
      res.status(400).send({ error: error });
      return;
    }

    // clear DB
    await prisma.color.deleteMany();
    await prisma.positionData.deleteMany();
    await prisma.controlData.deleteMany();
    await prisma.part.deleteMany();
    await prisma.dancer.deleteMany();
    await prisma.positionFrame.deleteMany();
    await prisma.controlFrame.deleteMany();
    await prisma.lEDEffect.deleteMany();
    await prisma.effectListData.deleteMany();

    // create fiber color

    const colorDict: TColorIdPair = {};
    await Promise.all(
      Object.keys(color).map(async (colorKey: string) => {
        const newColor = await prisma.color.create({
          data: {
            color: colorKey,
            colorCode: color[colorKey],
          },
        });
        colorDict[colorKey] = newColor.id;
      })
    );

    // create LED data
    const LEDDict: TPartLEDPair = {};
    await Promise.all(
      Object.keys(LEDEffects).map(async (partName: string) => {
        const effectData = LEDEffects[partName];
        const EffectIdDict: TLEDIdPair = {};
        await Promise.all(
          Object.keys(effectData).map(async (effectName: string) => {
            const frames = effectData[effectName].frames.map((frame) => {
              const LEDs = frame.LEDs.map((led) => {
                return [colorDict[led[0]], led[1]];
              });
              return { ...frame, LEDs };
            });
            // const frames = effectData[effectName].frames as Prisma.JsonObject[];
            const { repeat } = effectData[effectName];
            const led = await prisma.lEDEffect.create({
              data: {
                name: effectName,
                partName: partName,
                repeat: repeat,
                frames: frames,
              },
            });
            EffectIdDict[effectName] = led.id;
          })
        );
        LEDDict[partName] = EffectIdDict;
      })
    ).catch((e) => console.log(e));

    // create dancer & part object
    await Promise.all(
      dancer.map(async (dancerObj: TDancerData, dancerIdx) => {
        const { parts, name } = dancerObj;
        const newDancer = await prisma.dancer.create({
          data: {
            name: name,
            id: dancerIdx,
          },
        });
        const allParts: PartTmpData = {};

        // create unique partsList for every dancer
        const allPartsList = parts.map((partObj: TPartData) => {
          return partObj.name;
        });

        // sync parts
        await Promise.all(
          parts.map(async (partObj: TPartData) => {
            const { name, type, length } = partObj;
            const newPart = await prisma.part.create({
              data: {
                name: name,
                type: type,
                length: length,
                dancer: {
                  connect: { id: newDancer.id },
                },
              },
            });
            allParts[name] = { id: newPart.id, type: type };
          })
        );

        allDancer[name] = {
          id: newDancer.id,
          parts: allParts,
          partsList: allPartsList,
        };
      })
    ).catch((e) => {
      console.log(e);
    });

    // deal with position data
    await Promise.all(
      Object.values(position).map(async (frameObj: PosFrameTmpData) => {
        const { start, pos } = frameObj;
        const positionFrame = await prisma.positionFrame.create({
          data: {
            start: start,
          },
        });
        // sync pos
        await Promise.all(
          pos.map(async ([x, y, z], dancerIdx) => {
            await prisma.positionData.create({
              data: {
                x: x,
                y: y,
                z: z,
                dancer: {
                  connect: { id: allDancer[dancer[dancerIdx].name].id },
                },
                frame: { connect: { id: positionFrame.id } },
              },
            });
          })
        );
      })
    ).catch((e) => {
      console.log(e);
    });

    // deal with control data
    await Promise.all(
      Object.values(control).map(async (frameObj: CtrlFrameTmpData) => {
        const { fade, start, status } = frameObj;
        const controlFrame = await prisma.controlFrame.create({
          data: {
            start: start,
            fade: fade,
          },
        });
        // sync parts
        await Promise.all(
          status.map(async (dancerStatus, dancerIdx) => {
            const realDancer = dancer[dancerIdx];
            await Promise.all(
              dancerStatus.map(async (partStatus, partIdx) => {
                const realPart = realDancer.parts[partIdx];
                const tmpPart = allDancer[realDancer.name].parts[realPart.name];
                let controlDataJson: Prisma.JsonValue = {};
                if (tmpPart.type === "FIBER") {
                  if (partStatus[0] === "") {
                    controlDataJson = {
                      color: -1,
                      alpha: partStatus[1],
                    };
                  } else {
                    controlDataJson = {
                      color: colorDict[partStatus[0]],
                      alpha: partStatus[1],
                    };
                  }
                } else if (tmpPart.type === "LED") {
                  if (partStatus[0] === "") {
                    controlDataJson = {
                      src: -1,
                      alpha: partStatus[1],
                    };
                  } else {
                    controlDataJson = {
                      src: LEDDict[realPart.name][partStatus[0]],
                      alpha: partStatus[1],
                    };
                  }
                } else {
                  controlDataJson = {
                    value: partStatus[0],
                  };
                }
                await prisma.controlData.create({
                  data: {
                    value: controlDataJson,
                    part: {
                      connect: {
                        id: tmpPart.id,
                      },
                    },
                    frame: {
                      connect: { id: controlFrame.id },
                    },
                  },
                });
              })
            );
          })
        );
      })
    ).catch((e) => console.log(e));

    console.log("Data uploaded successfully!!");

    // update redis
    await initRedisPosition();
    await initRedisControl();
    res.status(200).end();
  } catch (err) {
    res.status(400).send({ err });
  }
};

export default uploadData;
