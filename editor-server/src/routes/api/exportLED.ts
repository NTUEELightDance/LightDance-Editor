import { Request, Response } from "express";

import db from "../../models";
import {
  ILED,
  ILEDEffects,
  ILEDEffectsEffect,
  IPart,
  TExportLED,
  TExportLEDPart,
} from "../../types/global";

const exportLED = async (req: Request, res: Response) => {
  try {
    const allPart = await db.Part.find({ type: "LED" });
    const result: TExportLED = {};
    await Promise.all(
      allPart.map(async (partObj: IPart) => {
        const partName = partObj.name;
        const part: TExportLEDPart = {};
        const allEffect = await db.LED.find({ partName });
        allEffect.map((effect: ILED) => {
          const { effectName, repeat, effects } = effect;
          // remove effects' _id
          const newEffects = effects.map((effectsData: ILEDEffects) => {
            const { effect, start, fade } = effectsData;
            // remove effect's _id
            const newEffect = effect.map((effectData: ILEDEffectsEffect) => {
              const { colorCode, alpha } = effectData;
              const newColor = parseInt(colorCode.replace("#", "0x"), 16);
              const r = (newColor >> 8) & 255;
              const g = (newColor >> 4) & 255;
              const b = newColor & 255;
              // console.log(newColor, alpha)
              console.log(r, g, b, alpha);
              // return { alpha, colorCode }
              return [r, g, b, alpha];
            });
            // return { effect: newEffect, start, fade }
            return { LEDs: newEffect, start, fade };
          });
          // part[effectName] = { repeat, effects: newEffects }
          part[effectName] = { repeat, frames: newEffects };
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
