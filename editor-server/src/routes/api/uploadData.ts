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
  pos: {
    [key: string]: {
      x: number
      y: number
      z: number
    }
  }
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
    const { position, control, dancer, color, ledEffects } = dataObj;

    // save dancer data temporarily (including part data)
    const allDancer: DancerTmpData = {};
    const allPartsList: PartsListTmpData = {};

    // set of fiberColors & LEDPartNames
    const allFiberColors = new Set<string | number>();
    const allLEDPartNames = new Set<string>();

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
    // check LED part is used by any dancer
    Object.keys(ledEffects).map((partName: string) => {
      if (!allLEDPartNames.has(partName)) {
        throw new Error(`LED part '${partName}' is not used by any dancer!!`);
      }
    });
    const sortedDancerTmp = Object.keys(allPartsList).sort();
    Object.values(control).map((frameObj: CtrlFrameTmpData) => {
      const { fade, start, status } = frameObj;

      for (let i = 0; i < status.length; i++) {
        for (let j = 0; j < status[i].length; j++) {
          const tmpPart = allPartsList[sortedDancerTmp[i]][j];
          if (tmpPart.type === "FIBER") {
            if (!allFiberColors.has(status[i][j][0])) {
              throw new Error(`Fiber color '${status[i][j][0]}' not found!!`);
            }
          }
        }
      }
    });
    console.log("Data valid!!");

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
      Object.keys(ledEffects).map(async (partName: string) => {
        // if (!allLEDPartNames.has(partName)) {
        //   throw new Error(`LED part '${partName}' is not used by any dancer!!`)
        // }
        const effectData = ledEffects[partName];
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
        parts.map(async (partObj: TPartData) => {
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
        });
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
        await Promise.all(
          Object.keys(pos).map(async (dancer: string) => {
            const { x, y, z } = pos[dancer];
            const positionData = await prisma.positionData.create({
              data: {
                x: x,
                y: y,
                z: z,
                dancer: { connect: { id: allDancer[dancer].id } },
                frame: { connect: { id: positionFrame.id } },
              },
            });
          })
        ).catch((e) => console.log(e));
      })
    ).catch((e) => {
      console.log(e);
    });

    // deal with control data
    const sortedDancer = Object.keys(allDancer).sort();
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
        for (let i = 0; i < status.length; i++) {
          for (let j = 0; j < status[i].length; j++) {
            const tmpPart =
              allDancer[sortedDancer[i]].parts[
                allDancer[sortedDancer[i]].partsList[j]
              ];
            let controlDataJson: any = {};
            if (tmpPart.type === "FIBER") {
              if (!allFiberColors.has(status[i][j][0])) {
                throw new Error(`Fiber color '${status[i][j][0]}' not found!!`);
              }
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
