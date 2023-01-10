import {Request, Response} from "express";

import db from "../../models";
import { ILED, ILEDEffects, ILEDEffectsEffect, IPart, LooseObject } from "../../types/global";

const exportLED = async (req: Request, res: Response) => {
  try {
    const allPart = await db.Part.find({ type: "LED" });
    const result: LooseObject = {};
    await Promise.all(
      allPart.map(async (partObj: IPart) => {
        const partName = partObj.name;
        const part: LooseObject = {};
        const allEffect = await db.LED.find({ partName });
        allEffect.map((effect: ILED) => {
          const { effectName, repeat, effects } = effect;
          // remove effects' _id
          const newEffects = effects.map((effectsData: ILEDEffects) => {
            const { effect, start, fade } = effectsData;
            // remove effect's _id
            const newEffect = effect.map((effectData: ILEDEffectsEffect) => {
              const { colorCode, alpha } = effectData;
              return { alpha, colorCode };
            });
            return { effect: newEffect, start, fade };
          });
          part[effectName] = { repeat, effects: newEffects };
        });
        result[partName] = part;
      })
    );
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(result));
  } catch (err) {
    res.status(404).send({ err });
  }
};

export default exportLED;
