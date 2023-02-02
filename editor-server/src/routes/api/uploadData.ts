import { Request, Response } from "express";
import { Document, PromiseProvider } from "mongoose";

import db from "../../models";
import prisma from "../../prisma";
import { generateID, initRedisControl, initRedisPosition } from "../../utility";
import {
  IDancer,
  IPart,
  TDancerData,
  TExportData,
  TPartData,
} from "../../types/global";

type DancerTmpData = {
  [key: string]: {
    dancer: IDancer & Document
    parts: PartTmpData
  }
}
type PartTmpData = {
  [key: string]: IPart & Document
}
const PartLists = [
  "Visor",
  "Chest",
  "Shoulder_R",
  "Shoulder_L",
  "Arm_R",
  "Arm_L",
  "Waist_R",
  "Waist_L",
  "Thigh_R",
  "Thigh_L",
  "Calf_R",
  "Calf_L",
  "Visor_LED",
  "Shoulder_L_LED",
  "Shoulder_R_LED",
  "Hand_L_LED",
  "Hand_R_LED",
  "Shoe_R_LED",
  "Shoe_L_LED",
  "Ear",
  "CollarBone",
  "CollarBone_LED",
  "LymphaticDuct_R_U",
  "LymphaticDuct_R_D",
  "LymphaticDuct_L_U",
  "LymphaticDuct_L_D",
];

const uploadData = async (req: Request, res: Response) => {
  try {
    // read request
    const data = Array.isArray(req.files!.data)
      ? req.files!.data[0]
      : req.files!.data;
    const dataObj: TExportData = JSON.parse(data.data.toString("ascii"));
    const { position, control, dancer, color } = dataObj;

    // save dancer & part data temporarily before executing .save()
    // const allDancer: DancerTmpData = {}
    const allDancer: any = {};

    // clear DB
    // await db.Dancer.deleteMany()
    // await db.Part.deleteMany()
    // await db.Control.deleteMany()
    // await db.ControlFrame.deleteMany()
    // await db.Position.deleteMany()
    // await db.PositionFrame.deleteMany()
    // await db.Color.deleteMany()
    await prisma.color.deleteMany();
    await prisma.positionData.deleteMany();
    await prisma.part.deleteMany();
    await prisma.dancer.deleteMany();
    await prisma.positionFrame.deleteMany();
    // await prisma.controlData.deleteMany()
    await prisma.controlFrame.deleteMany();

    // create client object
    // await Promise.all(
    //   Object.keys(color).map(async (colorKey: string) => {
    //     await new db.Color({
    //       color: colorKey,
    //       colorCode: color[colorKey],
    //     })
    //   })
    // )
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

    // create dancer & part mongoose object
    // await Promise.all(
    //   dancer.map(async (dancerObj: TDancerData) => {
    //     const { parts, name } = dancerObj
    //     const allPart: PartTmpData = {}
    //     const partIDs = await Promise.all(
    //       parts.map(async (partObj: TPartData) => {
    //         const { name, type } = partObj
    //         const part: IPart & Document = new db.Part({
    //           name,
    //           type,
    //           id: generateID(),
    //           controlData: [],
    //         })
    //         allPart[name] = part
    //         return part._id
    //       })
    //     )
    //     const dancer = new db.Dancer({
    //       name,
    //       id: generateID(),
    //       parts: partIDs,
    //       positionData: [],
    //     })
    //     allDancer[name] = { dancer, parts: allPart }
    //   })
    // )
    await Promise.all(
      dancer.map(async (dancerObj: TDancerData) => {
        const { parts, name } = dancerObj;
        const newDancer = await prisma.dancer.create({
          data: {
            name: name,
          },
        });
        // console.log(newDancer)
        const allParts: any = {};
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
          allParts[name] = { id: newPart.id };
        });
        allDancer[name] = { id: newDancer.id, parts: allParts };
      })
    ).catch((e) => {
      console.log(e);
    });
    // console.log("finished dancer")
    // deal with position data
    // await Promise.all(
    //   Object.values(position).map(async (frameObj: any) => {
    //     const { start, pos } = frameObj
    //     const positionFrame = await new db.PositionFrame({
    //       start,
    //       id: generateID(),
    //     }).save()
    //     const frame = positionFrame._id
    //     await Promise.all(
    //       Object.keys(pos).map(async (dancer: string) => {
    //         const { x, y, z } = pos[dancer]
    //         const positionData = await new db.Position({
    //           x,
    //           y,
    //           z,
    //           frame,
    //         }).save()
    //         allDancer[dancer].dancer.positionData.push(positionData._id)
    //       })
    //     )
    //   })
    // )
    // console.log(allDancerNew)
    await Promise.all(
      Object.values(position).map(async (frameObj: any) => {
        const { start, pos } = frameObj;
        const positionFrame = await prisma.positionFrame.create({
          data: {
            start: start,
          },
        });
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
        });
      })
    ).catch((e) => {
      console.log(e);
    });
    console.log("finish");

    // deal with control data
    // await Promise.all(
    //   Object.values(control).map(async (frameObj) => {
    //     const { fade, start, status } = frameObj
    //     const frame = await new db.ControlFrame({
    //       fade,
    //       start,
    //       id: generateID(),
    //     })
    //       .save()
    //       .then((value) => value._id)
    //     await Promise.all(
    //       Object.keys(status).map(async (dancer: string) => {
    //         await Promise.all(
    //           Object.keys(status[dancer]).map(async (part: string) => {
    //             const value = status[dancer][part]
    //             if (allDancer[dancer].parts[part].type == "EL") {
    //               const controlID = await new db.Control({
    //                 frame,
    //                 value: { value },
    //               })
    //                 .save()
    //                 .then((value) => value._id)
    //               allDancer[dancer].parts[part].controlData.push(controlID)
    //             } else {
    //               const controlID = await new db.Control({ frame, value })
    //                 .save()
    //                 .then((value) => value._id)
    //               allDancer[dancer].parts[part].controlData.push(controlID)
    //             }
    //           })
    //         )
    //       })
    //     )
    //   })
    // )
    const sortedDancer = Object.keys(allDancer).sort();
    console.log(sortedDancer);
    console.dir(allDancer, { depth: null });
    await Promise.all(
      Object.values(control).map(async (frameObj: any) => {
        const { fade, start, status } = frameObj;
        const controlFrame = await prisma.controlFrame.create({
          data: {
            start: start,
            fade: fade,
          },
        });
        for (let i = 0; i < status.length; i++) {
          // allDancerNew[sortedDancer[i]]
          for (let j = 0; j < status[i].length; j++) {
            const controlDataJson = {
              color: status[i][j][0],
              alpha: status[i][j][1],
            };
            const controlData = await prisma.controlData.create({
              data: {
                value: controlDataJson,
                part: {
                  connect: {
                    id: allDancer[sortedDancer[i]].parts[PartLists[j]].id,
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

    // execute .save() on dancer & part
    // await Promise.all(
    //   Object.values(allDancer).map(async (dancerObj) => {
    //     const { dancer, parts } = dancerObj
    //     await dancer.save()
    //     await Promise.all(
    //       Object.values(parts).map(async (part) => {
    //         await part.save()
    //       })
    //     )
    //   })
    // )

    // update redis
    await initRedisPosition();
    await initRedisControl();
    res.status(200).end();
  } catch (err) {
    res.status(400).send({ err });
  }
};

export default uploadData;
