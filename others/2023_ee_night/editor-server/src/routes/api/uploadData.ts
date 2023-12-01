import { Request, Response } from "express";
import { PromisePool } from "@supercharge/promise-pool";
import cliProgress from "cli-progress";

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
    const {
      position: uploadedPositionData,
      control: uploadedControlData,
      dancer: uploadedDancerData,
      color: uploadedColorData,
      LEDEffects: uploadedLEDEffectsData,
    } = dataObj;

    // save dancer data temporarily (including part data)
    const allDancer: DancerTmpData = {};
    const allPartsList: PartsListTmpData = {};

    // set of fiberColors & LEDPartNames
    const allFiberColors = new Set<string | number>();

    const error: string[] = [];

    // check all data are valid
    // check main type
    if (!isArray(uploadedDancerData))
      error.push(
        "DANCER_DATA_ERROR: Dancer has incorrect type. Expected type array."
      );
    if (typeof uploadedPositionData !== "object")
      error.push(
        "POSITIONFRAME_DATA_ERROR: Position has incorrect type. Expected type object."
      );
    if (typeof uploadedControlData !== "object")
      error.push(
        "CTRLFRAME_DATA_ERROR: Control has incorrect type. Expected type object."
      );
    if (typeof uploadedColorData !== "object")
      error.push(
        "COLOR_DATA_ERROR: Color has incorrect type. Expected type object."
      );
    if (typeof uploadedLEDEffectsData !== "object")
      error.push(
        "LEDEFFECT_DATA_ERROR: LEDEffect has incorrect type. Expected type object."
      );
    if (error.length > 0) {
      res.status(400).send({ error: error });
      return;
    }

    // check color data type & add fiber color list
    Object.keys(uploadedColorData).forEach((colorKey: string) => {
      allFiberColors.add(colorKey);
      if (!isArray(uploadedColorData[colorKey])) {
        error.push(
          `COLOR_DATA_ERROR: Color ${colorKey}'s value type is ${typeof uploadedColorData[
            colorKey
          ]}, while array expected.`
        );
        return;
      }
      if (uploadedColorData[colorKey].length !== 3) {
        error.push(
          `COLOR_DATA_ERROR: Color ${colorKey}'s value length is ${uploadedColorData[colorKey].length}, while 3 expected.`
        );
        return;
      }
      if (
        typeof uploadedColorData[colorKey][0] !== "number" ||
        typeof uploadedColorData[colorKey][1] !== "number" ||
        typeof uploadedColorData[colorKey][2] !== "number"
      ) {
        error.push(
          `COLOR_DATA_ERROR: Color ${colorKey}'s value type is incorrect, expected 3 number.`
        );
      }
    });

    // check dancer data type
    uploadedDancerData.forEach((dancerObj: TDancerData, dancerIdx) => {
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
    Object.keys(uploadedLEDEffectsData).forEach((partName: string) => {
      const effectData = uploadedLEDEffectsData[partName];
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
    Object.keys(uploadedPositionData).forEach((frameId: string) => {
      const frameObj: PosFrameTmpData = uploadedPositionData[frameId];
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
    Object.keys(uploadedControlData).map((frameId: string) => {
      const frameObj: CtrlFrameTmpData = uploadedControlData[frameId];
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
              const tmpPart = uploadedDancerData[dancerIdx].parts[partIdx];
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
                  !Object.keys(uploadedLEDEffectsData[tmpPart.name]).includes(
                    partStatus[0]
                  )
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
    await Promise.all([
      prisma.color.deleteMany(),
      prisma.positionData.deleteMany(),
      prisma.controlData.deleteMany(),
      prisma.part.deleteMany(),
      prisma.dancer.deleteMany(),
      prisma.positionFrame.deleteMany(),
      prisma.controlFrame.deleteMany(),
      prisma.lEDEffect.deleteMany(),
      prisma.effectListData.deleteMany(),
    ]);

    console.log("DB cleared");

    const colorDict: TColorIdPair = {};

    const colorProgress = new cliProgress.SingleBar(
      {
        format:
          "Create Colors [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
      },
      cliProgress.Presets.shades_classic
    );

    colorProgress.start(Object.entries(uploadedColorData).length, 0);
    await PromisePool.for(Object.entries(uploadedColorData)).process(
      async ([colorKey, colorCode]) => {
        const newColor = await prisma.color.create({
          data: {
            color: colorKey,
            colorCode,
          },
        });
        colorDict[colorKey] = newColor.id;
        colorProgress.increment();
      }
    );
    colorProgress.stop();

    const LEDDict: TPartLEDPair = {};

    const LEDProgress = new cliProgress.SingleBar(
      {
        format:
          "Creates LED Effects [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
      },
      cliProgress.Presets.shades_classic
    );

    for (const [partName, effects] of Object.entries(uploadedLEDEffectsData)) {
      const EffectIdDict: TLEDIdPair = {};
      await PromisePool.for(Object.entries(effects)).process(
        async ([effectName, effectData]) => {
          const frames = effectData.frames.map((frame) => {
            const LEDs = frame.LEDs.map((led) => {
              return [colorDict[led[0]], led[1]];
            });
            return { ...frame, LEDs };
          });
          // const frames = effectData[effectName].frames as Prisma.JsonObject[];
          const { repeat } = effectData;
          const led = await prisma.lEDEffect.create({
            data: {
              name: effectName,
              partName: partName,
              repeat: repeat,
              frames: frames,
            },
          });
          EffectIdDict[effectName] = led.id;
        }
      );
      LEDDict[partName] = EffectIdDict;
      LEDProgress.increment();
    }
    LEDProgress.stop();

    const dancerProgress = new cliProgress.SingleBar(
      {
        format:
          "Create Dancers [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
      },
      cliProgress.Presets.shades_classic
    );

    dancerProgress.start(uploadedDancerData.length, 0);
    for (const [dancerIndex, dancer] of uploadedDancerData.entries()) {
      const { parts, name } = dancer;
      const newDancer = await prisma.dancer.create({
        data: {
          name: name,
          id: dancerIndex,
        },
      });
      const allParts: PartTmpData = {};

      // create unique partsList for every dancer
      const allPartsList = parts.map((partObj: TPartData) => {
        return partObj.name;
      });

      await PromisePool.for(parts).process(async (partObj: TPartData) => {
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
      });

      allDancer[name] = {
        id: newDancer.id,
        parts: allParts,
        partsList: allPartsList,
      };

      dancerProgress.increment();
    }
    dancerProgress.stop();

    const positionProgress = new cliProgress.SingleBar(
      {
        format:
          "Create Position Data [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
      },
      cliProgress.Presets.shades_classic
    );

    positionProgress.start(Object.values(uploadedPositionData).length, 0);
    for (const frameObj of Object.values(uploadedPositionData)) {
      const { start, pos } = frameObj;
      const positionFrame = await prisma.positionFrame.create({
        data: {
          start: start,
        },
      });

      await PromisePool.withConcurrency(30)
        .for(pos)
        .process(async ([x, y, z], dancerIdx) => {
          await prisma.positionData.create({
            data: {
              x: x,
              y: y,
              z: z,
              dancer: {
                connect: {
                  id: allDancer[uploadedDancerData[dancerIdx].name].id,
                },
              },
              frame: { connect: { id: positionFrame.id } },
            },
          });
        });

      positionProgress.increment();
    }
    positionProgress.stop();

    const controlProgress = new cliProgress.SingleBar(
      {
        format:
          "Create Control Data [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
      },
      cliProgress.Presets.shades_classic
    );

    controlProgress.start(Object.values(uploadedControlData).length, 0);
    for (const frameObj of Object.values(uploadedControlData)) {
      const { fade, start, status } = frameObj;
      const controlFrame = await prisma.controlFrame.create({
        data: {
          start: start,
          fade: fade,
        },
      });

      await PromisePool.withConcurrency(50)
        .for(
          status
            .map((dancerStatus, dancerIdx) => ({
              realDancer: uploadedDancerData[dancerIdx],
              dancerStatus,
            }))
            .map(({ realDancer, dancerStatus }) => {
              return dancerStatus.map((partStatus, partIdx) => {
                const realPart = realDancer.parts[partIdx];
                return {
                  realPart,
                  tmpPart: allDancer[realDancer.name].parts[realPart.name],
                  partStatus,
                };
              });
            })
            .flat()
        )
        .process(async ({ partStatus, realPart, tmpPart }) => {
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
        });

      controlProgress.increment();
    }
    controlProgress.stop();

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
