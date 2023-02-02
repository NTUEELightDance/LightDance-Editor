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

const uploadData = async (req: Request, res: Response) => {
  try {
    // read request
    const data = Array.isArray(req.files!.data)
      ? req.files!.data[0]
      : req.files!.data;
    const dataObj: TExportData = JSON.parse(data.data.toString("ascii"));
    const { position, control, dancer, color } = dataObj;

    // save dancer & part data temporarily before executing .save()
    const allDancer: any = {};

    // clear DB
    await prisma.color.deleteMany();
    await prisma.positionData.deleteMany();
    await prisma.controlData.deleteMany();
    await prisma.part.deleteMany();
    await prisma.dancer.deleteMany();
    await prisma.positionFrame.deleteMany();
    await prisma.controlFrame.deleteMany();

    // create client object
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
        const allParts: any = {};
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
          allParts[name] = { id: newPart.id };
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
      Object.values(position).map(async (frameObj: any) => {
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
                    id: allDancer[sortedDancer[i]].parts[
                      allDancer[sortedDancer[i]].partsList[j]
                    ].id,
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

    console.log("data updated successfully");

    // update redis
    await initRedisPosition();
    await initRedisControl();
    res.status(200).end();
  } catch (err) {
    res.status(400).send({ err });
  }
};

export default uploadData;
