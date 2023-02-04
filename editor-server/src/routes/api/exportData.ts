import { Request, Response } from "express";

import db from "../../models";
import redis from "../../redis";
import {
  IColor,
  IControlFrame,
  IPositionFrame,
  TColorData,
  TControlData,
  TControlDataTest,
  TDancerData,
  TExportData,
  TPositionData,
} from "../../types/global";

const exportData = async (req: Request, res: Response) => {
  try {
    // grab control data from redis
    const controlFrames = await db.ControlFrame.find();
    // const control: TControlData = {}
    const control: TControlDataTest = {};
    await Promise.all(
      controlFrames.map(async (frame: IControlFrame) => {
        const { id } = frame;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj = JSON.parse(cache);
          delete cacheObj.editing;
          // console.log(cacheObj, id)
          // control[id] = cacheObj

          const ControlStatus: any[][][] = [];
          const { fade, start, status } = cacheObj;
          // console.log(fade, start, status)

          const sorted_dancers = Object.keys(status).sort();
          // console.log(sorted_dancers)
          sorted_dancers.map((dancer) => {
            // console.log(status[dancer])
            const parts: any[][] = [];
            Object.keys(status[dancer]).map((part) => {
              const elements: any[] = [];
              Object.keys(status[dancer][part]).map((element) => {
                elements.push(status[dancer][part][element]);
              });
              parts.push(elements);
            });
            ControlStatus.push(parts);
          });
          // console.log(ControlStatus)
          const newCacheObj = {
            fade,
            start: Math.floor(start),
            status: ControlStatus,
          };
          // console.log(newCacheObj)

          control[id] = newCacheObj;
        } else {
          throw new Error(`Frame ${id} not found in redis.`);
        }
      })
    );

    // grab position data from redis
    const positionFrames = await db.PositionFrame.find();
    const position: TPositionData = {};
    await Promise.all(
      positionFrames.map(async (frame: IPositionFrame) => {
        const { id } = frame;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj = JSON.parse(cache);
          delete cacheObj.editing;
          position[id] = cacheObj;
        } else {
          throw new Error(`Frame ${id} not found in redis.`);
        }
      })
    );

    // grab dancer data from db
    const dancer: TDancerData[] = await db.Dancer.find(
      {},
      "name parts -_id"
    ).populate({
      path: "parts",
      select: "name type -_id",
    });

    const colorData = await db.Color.find({}, "color colorCode -_id");
    const color: TColorData = {};
    colorData.map((colorObj: IColor) => {
      color[colorObj.color] = colorObj.colorCode;
    });

    const data: {
      position: TPositionData
      // control: TControlData
      control: TControlDataTest
      dancer: TDancerData[]
      color: TColorData
    } = { position, control, dancer, color };
    // console.log(data)
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(data));
  } catch (err) {
    res.status(404).send({ err });
  }
};

export default exportData;
