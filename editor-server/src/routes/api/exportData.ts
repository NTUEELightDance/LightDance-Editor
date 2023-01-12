import {Request, Response} from "express";

import db from "../../models";
import redis from "../../redis";
import { IColor, IControlFrame, IPositionFrame, TColorData, TControlData, TDancerData, TExportData, TPositionData } from "../../types/global";

const exportData = async (req: Request, res: Response) => {
  try {
    // grab control data from redis
    const controlFrames = await db.ControlFrame.find();
    const control: TControlData = {};
    await Promise.all(
      controlFrames.map(async (frame: IControlFrame) => {
        const { id } = frame;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj = JSON.parse(cache);
          delete cacheObj.editing;
          control[id] = cacheObj;
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
    const dancer: TDancerData[] = await db.Dancer.find({}, "name parts -_id").populate({
      path: "parts",
      select: "name type -_id",
    });

    const colorData = await db.Color.find({}, "color colorCode -_id");
    const color: TColorData = {};
    colorData.map((colorObj: IColor) => {
      color[colorObj.color] = colorObj.colorCode;
    });

    const data: TExportData = { position, control, dancer, color };
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(data));
  } catch (err) {
    res.status(404).send({ err });
  }
};

export default exportData;
