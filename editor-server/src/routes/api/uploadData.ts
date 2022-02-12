import db from "../../models";
import { generateID, initRedisControl, initRedisPosition } from "../../utility";

interface LooseObject {
  [key: string]: any;
}

export default async (req: any, res: any) => {
  try {
    const { data } = req.files;
    const dataObj = JSON.parse(data.data.toString("ascii"));
    const { position, control, dancer } = dataObj;
    const allDancer: LooseObject = {};
    await db.Dancer.deleteMany();
    await db.Part.deleteMany();
    await db.Control.deleteMany();
    await db.ControlFrame.deleteMany();
    await db.Position.deleteMany();
    await db.PositionFrame.deleteMany();
    await Promise.all(
      dancer.map(async (dancerObj: any) => {
        const { parts, name } = dancerObj;
        const allPart: LooseObject = {};
        const partIDs = await Promise.all(
          parts.map(async (partObj: any) => {
            const { name, type } = partObj;
            const part = new db.Part({
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
    await Promise.all(
      Object.values(control).map(async (frameObj: any) => {
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
                let value = status[dancer][part];
                if (allDancer[dancer].parts[part].type == "EL") {
                  value = { value };
                }
                const controlID = await new db.Control({ frame, value })
                  .save()
                  .then((value) => value._id);
                allDancer[dancer].parts[part].controlData.push(controlID);
              })
            );
          })
        );
      })
    );
    await Promise.all(
      Object.values(allDancer).map(async (dancerObj: any) => {
        const { dancer, parts } = dancerObj;
        await dancer.save();
        await Promise.all(
          Object.values(parts).map(async (part: any) => {
            await part.save();
          })
        );
      })
    );
    await initRedisPosition();
    await initRedisControl();
    res.status(200).end();
  } catch (err) {
    res.status(400).send({ err });
  }
};
