import {Request, Response} from "express";

import db from "../../models";

import { LooseObject } from "../../types/global";

const uploadLED = async (req: Request, res: Response) => {
  try {
    // read request
    const data = Array.isArray(req.files!.data) ? req.files!.data[0] : req.files!.data;
    const { clear } = req.body;
    const allPart = JSON.parse(data.data.toString("ascii"));

    if (clear == "true") {
      await db.LED.deleteMany();
      console.log("LED db is cleared.");
    }
    await Promise.all(
      Object.keys(allPart).map(async (partName: string) => {
        const part = await db.Part.findOne({ name: partName, type: "LED" });
        if (!part) {
          throw new Error(`Part ${partName} not found!`);
        }
      })
    );

    await Promise.all(
      Object.keys(allPart).map(async (partName: string) => {
        const effectData = allPart[partName];
        await Promise.all(
          Object.keys(effectData).map(async (effectName: any) => {
            // if overlapped, update the origin one
            await db.LED.deleteOne({ effectName, partName });
            const { effects, repeat } = effectData[effectName];
            await new db.LED({ effects, repeat, effectName, partName }).save();
          })
        );
      })
    );
    res.status(200).end();
  } catch (err) {
    res.status(400).send({ err });
  }
};

export default uploadLED;
