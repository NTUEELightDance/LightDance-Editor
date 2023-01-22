import { Request, Response } from "express";
import { Document } from "mongoose";

import db from "../../models";
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
    dancer: IDancer & Document;
    parts: PartTmpData;
  };
};
type PartTmpData = {
  [key: string]: IPart & Document;
};

const uploadData = async (req: Request, res: Response) => {
  try {
    // read request
    const data = Array.isArray(req.files!.data)
      ? req.files!.data[0]
      : req.files!.data;
    const dataObj: TExportData = JSON.parse(data.data.toString("ascii"));
    const { position, control, dancer, color } = dataObj;

    // save dancer & part data temporarily before executing .save()
    const allDancer: DancerTmpData = {};

    // clear DB
    await db.Dancer.deleteMany();
    await db.Part.deleteMany();
    await db.Control.deleteMany();
    await db.ControlFrame.deleteMany();
    await db.Position.deleteMany();
    await db.PositionFrame.deleteMany();
    await db.Color.deleteMany();

    // create client object
    await Promise.all(
      Object.keys(color).map(async (colorKey: string) => {
        await new db.Color({
          color: colorKey,
          colorCode: color[colorKey],
        }).save();
      })
    );

    // create dancer & part mongoose object
    await Promise.all(
      dancer.map(async (dancerObj: TDancerData) => {
        const { parts, name } = dancerObj;
        const allPart: PartTmpData = {};
        const partIDs = await Promise.all(
          parts.map(async (partObj: TPartData) => {
            const { name, type } = partObj;
            const part: IPart & Document = new db.Part({
              name,
              type,
              id: generateID(),
              controlData: [],
            });
            allPart[name] = part;
            return part._id;
          })
        );
        const dancer = new db.Dancer({
          name,
          id: generateID(),
          parts: partIDs,
          positionData: [],
        });
        allDancer[name] = { dancer, parts: allPart };
      })
    );

    // deal with position data
    await Promise.all(
      Object.values(position).map(async (frameObj: any) => {
        const { start, pos } = frameObj;
        const positionFrame = await new db.PositionFrame({
          start,
          id: generateID(),
        }).save();
        const frame = positionFrame._id;
        await Promise.all(
          Object.keys(pos).map(async (dancer: string) => {
            const { x, y, z } = pos[dancer];
            const positionData = await new db.Position({
              x,
              y,
              z,
              frame,
            }).save();
            allDancer[dancer].dancer.positionData.push(positionData._id);
          })
        );
      })
    );

    // deal with control data
    await Promise.all(
      Object.values(control).map(async (frameObj) => {
        const { fade, start, status } = frameObj;
        const frame = await new db.ControlFrame({
          fade,
          start,
          id: generateID(),
        })
          .save()
          .then((value) => value._id);
        await Promise.all(
          Object.keys(status).map(async (dancer: string) => {
            await Promise.all(
              Object.keys(status[dancer]).map(async (part: string) => {
                const value = status[dancer][part];
                if (allDancer[dancer].parts[part].type == "EL") {
                  const controlID = await new db.Control({
                    frame,
                    value: { value },
                  })
                    .save()
                    .then((value) => value._id);
                  allDancer[dancer].parts[part].controlData.push(controlID);
                } else {
                  const controlID = await new db.Control({ frame, value })
                    .save()
                    .then((value) => value._id);
                  allDancer[dancer].parts[part].controlData.push(controlID);
                }
              })
            );
          })
        );
      })
    );

    // execute .save() on dancer & part
    await Promise.all(
      Object.values(allDancer).map(async (dancerObj) => {
        const { dancer, parts } = dancerObj;
        await dancer.save();
        await Promise.all(
          Object.values(parts).map(async (part) => {
            await part.save();
          })
        );
      })
    );

    // update redis
    await initRedisPosition();
    await initRedisControl();
    res.status(200).end();
  } catch (err) {
    res.status(400).send({ err });
  }
};

export default uploadData;
