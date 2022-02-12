import db from "../../models";
import redis from "../../redis";

interface LooseObject {
  [key: string]: any;
}

export default async (req: any, res: any) => {
  try {
    const controlFrames = await db.ControlFrame.find();
    const control: LooseObject = {};
    await Promise.all(
      controlFrames.map(async (frame: any) => {
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
    const positionFrames = await db.PositionFrame.find();
    const position: LooseObject = {};
    await Promise.all(
      positionFrames.map(async (frame: any) => {
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
    const dancer = await db.Dancer.find({}, "name parts -_id").populate({
      path: "parts",
      select: "name type -_id",
    });
    const data = { position, control, dancer };
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(data));
  } catch (err) {
    res.status(404).send({ err });
  }
};
