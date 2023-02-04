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
} from "../../types/global";

type DancerTmpData = {
  [key: string]: {
    id: number
    parts: PartTmpData
    partsList: string[]
  }
}
type PartTmpData = {
  [key: string]: {
    type: "LED" | "FIBER"
    id: number
  }
}
type CtrlFrameTmpData = {
  fade: boolean
  start: number
  status: (TELControl | TLEDControl | TFiberControl)[][]
}
type PosFrameTmpData = {
  start: number
  pos: TPositionPos[]
}
type PartsListTmpData = {
  // key: dancer name
  [key: string]: TPartData[]
}

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
    const allLEDPartNames = new Set<string>();

    // check all data are valid

    // add fiber color list
    Object.keys(color).map((colorKey: string) => {
      allFiberColors.add(colorKey);
    });
    // add LED part list
    dancer.map((dancerObj: TDancerData) => {
      const { parts, name } = dancerObj;
      // console.log(allPartsList)
      allPartsList[name] = parts.map((partObj: TPartData) => {
        const { name, type } = partObj;
        if (type === "LED") allLEDPartNames.add(name);
        return partObj;
      });
    });

    // check LED data shape
    Object.keys(LEDEffects).map(async (partName: string) => {
      const effectData = LEDEffects[partName];
      Object.keys(effectData).map(async (effectName: string) => {
        const { repeat, frames } = effectData[effectName];
        frames.map(async (frame: TExportLEDFrame) => {
          const { LEDs, start, fade } = frame;
          // console.log(LEDs, start, fade)
          // const newLEDs = LEDs.map((LED: number[]) => {
          //   return { r: LED[0], g: LED[1], b: LED[2], a: LED[3] }
          // })
          LEDs.map((LED: TExportLEDFrameLED) => {
            const [r, g, b, a] = LED;
          });
        });
      });
    });

    // check LED part is used by any dancer
    Object.keys(LEDEffects).map((partName: string) => {
      if (!allLEDPartNames.has(partName)) {
        console.log(`LED part '${partName}' is not used by any dancer!!`);
      }
    });

    // check every position frame has the same number of real dancers
    Object.values(position).map(async (frameObj: PosFrameTmpData) => {
      const { start, pos } = frameObj;
      if (pos.length !== Object.keys(allPartsList).length) {
        throw new Error(
          `POSITIONFRAME_DATA_ERROR: Position frame starting at ${start}ms has invalid number of dancers. Found ${
            pos.length
          }, Expected ${Object.keys(allPartsList).length}`
        );
      }
      pos.map(async (dancerPos) => {
        if (dancerPos.length !== 3) {
          throw new Error(
            `POSITIONFRAME_DATA_ERROR: Position frame  starting at ${start}ms`
          );
        }
        const [x, y, z] = dancerPos;
      });
    });

    // check every dancer in every control frame has the same number of real parts
    Object.values(control).map(async (frameObj: CtrlFrameTmpData) => {
      const { fade, start, status } = frameObj;
      if (status.length !== Object.keys(allPartsList).length) {
        throw new Error(
          `CTRLFRAME_DATA_ERROR: Control frame starting at ${start}ms has invalid number of dancers. Found ${
            status.length
          }, Expected ${Object.keys(allPartsList).length}`
        );
      }
      for (let i = 0; i < status.length; i++) {
        if (
          status[i].length !==
          Object.values(allPartsList[Object.keys(allPartsList)[i]]).length
        ) {
          throw new Error(
            `CTRLFRAME_DATA_ERROR: Control Frame starting at ${start}ms, dancer '${
              Object.keys(allPartsList)[i]
            }' has invalid number of parts. Found ${
              status[i].length
            }, Expected ${Object.values(allPartsList).length}`
          );
        }
      }
    });

    // validate status data & fiber color
    const sortedDancerTmp = Object.keys(allPartsList).sort();
    Object.values(control).map((frameObj: CtrlFrameTmpData) => {
      const { fade, start, status } = frameObj;

      for (let i = 0; i < status.length; i++) {
        for (let j = 0; j < status[i].length; j++) {
          const tmpPart = allPartsList[sortedDancerTmp[i]][j];
          if (tmpPart.type === "FIBER") {
            if (status[i][j][0] && typeof status[i][j][0] !== "string") {
              throw new Error(
                `CTRLFRAME_DATA_ERROR: Invalid Fiber color type!! (at: Control Frame starting at ${start}ms, dancer '${sortedDancerTmp[i]}, part '${tmpPart.name}')`
              );
            }
            if (status[i][j][0] && !allFiberColors.has(status[i][j][0])) {
              throw new Error(
                `CTRLFRAME_DATA_ERROR: Fiber color '${status[i][j][0]}' not found!!`
              );
            }
            if (status[i][j][1] && typeof status[i][j][1] !== "number") {
              throw new Error(
                `CTRLFRAME_DATA_ERROR: Invalid Fiber alpha type!! (at: Control Frame starting at ${start}ms, dancer '${sortedDancerTmp[i]}, part '${tmpPart.name}')`
              );
            }
          } else if (tmpPart.type === "LED") {
            if (status[i][j][0] && typeof status[i][j][0] !== "string") {
              throw new Error(
                `CTRLFRAME_DATA_ERROR: Invalid LED src type!! (at: Control Frame starting at ${start}ms, dancer '${sortedDancerTmp[i]}, part '${tmpPart.name}')`
              );
            }
            if (status[i][j][1] && typeof status[i][j][1] !== "number") {
              throw new Error(
                `CTRLFRAME_DATA_ERROR: Invalid LED alpha type!! (at: Control Frame starting at ${start}ms, dancer '${sortedDancerTmp[i]}, part '${tmpPart.name}')`
              );
            }
          } else {
            // EL
            if (status[i][j][0] && typeof status[i][j][0] !== "number") {
              throw new Error(
                `CTRLFRAME_DATA_ERROR: Invalid EL value type!! (at: Control Frame starting at ${start}ms, dancer '${sortedDancerTmp[i]}, part '${tmpPart.name}')`
              );
            }
          }
        }
      }
    });

    // console.log("Data valid!!")

    // clear DB
    await prisma.color.deleteMany();
    await prisma.positionData.deleteMany();
    await prisma.controlData.deleteMany();
    await prisma.part.deleteMany();
    await prisma.dancer.deleteMany();
    await prisma.positionFrame.deleteMany();
    await prisma.controlFrame.deleteMany();
    await prisma.lEDFrame.deleteMany();
    await prisma.lEDEffect.deleteMany();

    // create client object

    // create fiber color
    await Promise.all(
      Object.keys(color).map(async (colorKey: string) => {
        await prisma.color.create({
          data: {
            color: colorKey,
            colorCode: color[colorKey],
          },
        });
      })
    );

    // create LED data
    await Promise.all(
      Object.keys(LEDEffects).map(async (partName: string) => {
        const effectData = LEDEffects[partName];
        Object.keys(effectData).map(async (effectName: string) => {
          const { repeat, frames } = effectData[effectName];
          const newLEDEffect = await prisma.lEDEffect.create({
            data: {
              name: effectName,
              partName: partName,
              repeat: repeat,
            },
          });
          frames.map(async (frame: TExportLEDFrame) => {
            const { LEDs, start, fade } = frame;
            // console.log(LEDs, start, fade)
            // const newLEDs = LEDs.map((LED: number[]) => {
            //   return { r: LED[0], g: LED[1], b: LED[2], a: LED[3] }
            // })
            await prisma.lEDFrame.create({
              data: {
                start: start,
                fade: fade,
                // LEDs: newLEDs,
                LEDs: LEDs,
                LEDEffect: {
                  connect: { id: newLEDEffect.id },
                },
              },
            });
          });
        });
      })
    ).catch((e) => console.log(e));

    // create dancer & part object
    await Promise.all(
      dancer.map(async (dancerObj: TDancerData) => {
        const { parts, name } = dancerObj;
        const newDancer = await prisma.dancer.create({
          data: {
            name: name,
          },
        });
        // console.log(newDancer)
        const allParts: PartTmpData = {};
        // create unique partsList for every dancer
        const allPartsList = parts.map((partObj: TPartData) => {
          return partObj.name;
        });
        // console.log(allPartsList)

        // sync parts
        for (let i = 0; i < parts.length; i++) {
          const partObj: TPartData = parts[i];

          const { name, type } = partObj;
          const newPart = await prisma.part.create({
            data: {
              name: name,
              type: type,
              dancer: {
                connect: { id: newDancer.id },
              },
            },
          });
          allParts[name] = { id: newPart.id, type: type };
        }
        allDancer[name] = {
          id: newDancer.id,
          parts: allParts,
          partsList: allPartsList,
        };
      })
    ).catch((e) => {
      console.log(e);
    });

    const sortedDancer = Object.keys(allDancer).sort();

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
        for (let i = 0; i < pos.length; i++) {
          const [x, y, z] = pos[i];
          const positionData = await prisma.positionData.create({
            data: {
              x: x,
              y: y,
              z: z,
              dancer: { connect: { id: allDancer[sortedDancer[i]].id } },
              frame: { connect: { id: positionFrame.id } },
            },
          });
        }
      })
    ).catch((e) => {
      console.log(e);
    });

    // deal with control data
    // console.log(sortedDancer)
    // console.dir(allDancer, { depth: null });
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
        for (let i = 0; i < status.length; i++) {
          for (let j = 0; j < status[i].length; j++) {
            const tmpPart =
              allDancer[sortedDancer[i]].parts[
                allDancer[sortedDancer[i]].partsList[j]
              ];
            let controlDataJson: any = {};
            if (tmpPart.type === "FIBER") {
              controlDataJson = {
                color: status[i][j][0],
                alpha: status[i][j][1],
              };
            } else if (tmpPart.type === "LED") {
              controlDataJson = {
                src: status[i][j][0],
                alpha: status[i][j][1],
              };
            } else {
              controlDataJson = {
                value: status[i][j][0],
              };
            }
            const controlData = await prisma.controlData.create({
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
          }
        }
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
