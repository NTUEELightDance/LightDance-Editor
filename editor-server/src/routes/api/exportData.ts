import { Request, Response } from "express";

import redis from "../../redis";
import prisma from "../../prisma";
import {
  IColor,
  IControlFrame,
  IPositionFrame,
  TColorData,
  TControlData,
  TDancerData,
  TExportData,
  TPositionData,
  TPositionDataTest,
  TRedisControlTest,
  TRedisPositionTest,
  TExportLED,
  TExportLEDPart,
  TExportLEDFrame,
} from "../../types/global";

const exportData = async (req: Request, res: Response) => {
  try {
    // grab color data
    const colorData = await prisma.color.findMany();
    const color: TColorData = {};
    // IColor
    colorData.map((colorObj) => {
      color[colorObj.color] = colorObj.colorCode;
    });
    // console.log(color)

    // grab dancer data
    const dancerData = await prisma.dancer.findMany({
      include: {
        parts: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });
    const dancer: TDancerData[] = [];
    dancerData
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .map((dancerObj) => {
        dancer.push({ name: dancerObj.name, parts: dancerObj.parts });
      });
    // console.dir(dancer, { depth: null })

    // grab control data from redis
    const controlFrames = await prisma.controlFrame.findMany();
    const control: TControlData = {};
    await Promise.all(
      controlFrames.map(async (frame) => {
        // id format in redis
        const id = `CTRLFRAME_${frame.id}`;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj: TRedisControlTest = JSON.parse(cache);
          delete cacheObj.editing;
          // console.log(cacheObj, id)
          // control[id] = cacheObj

          const { fade, start, status } = cacheObj;
          const newCacheObj = {
            fade,
            start: Math.floor(start),
            // status: ControlStatus,
            status,
          };
          // console.log(newCacheObj)

          // id(string) or frame.id(number)
          control[frame.id] = newCacheObj;
        } else {
          throw new Error(`Frame ${id} not found in redis.`);
        }
      })
    );
    // console.dir(control, { depth: null })

    // grab position data from redis
    const positionFrames = await prisma.positionFrame.findMany();
    const position: TPositionData = {};
    await Promise.all(
      positionFrames.map(async (frame) => {
        // id format in redis
        const id = `POSFRAME_${frame.id}`;
        const cache = await redis.get(id);
        if (cache) {
          const cacheObj: TRedisPositionTest = JSON.parse(cache);
          delete cacheObj.editing;
          position[frame.id] = cacheObj;
        } else {
          throw new Error(`Frame ${id} not found in redis.`);
        }
      })
    );
    // console.dir(position, { depth: null })

    // grab LEDEffect data
    const LEDParts = await prisma.part.findMany({
      where: {
        type: "LED",
      },
    });
    const LEDPartsName = LEDParts.map((LEDPart) => LEDPart.name).filter(
      (name, idx, a) => a.indexOf(name) === idx
    );

    const LEDEffects: TExportLED = {};
    await Promise.all(
      LEDPartsName.map(async (partName) => {
        const LEDPart: TExportLEDPart = {};
        const LEDPartEffects = await prisma.lEDEffect.findMany({
          where: {
            partName: partName,
          },
          include: {
            frames: true,
          },
        });
        // console.dir(LEDPartEffects, { depth: null })
        LEDPartEffects.map((LEDPartEffect) => {
          const { name, repeat, frames } = LEDPartEffect;
          const LEDFrames = frames.map((LEDFrame) => {
            const { LEDs, start, fade } = LEDFrame;
            const LEDFrameData: TExportLEDFrame = {
              LEDs: JSON.parse(JSON.stringify(LEDs)),
              start,
              fade,
            };
            return LEDFrameData;
          });
          // part[effectName] = { repeat, effects: newEffects }
          LEDPart[name] = { repeat, frames: LEDFrames };
        });
        LEDEffects[partName] = LEDPart;
      })
    );
    console.dir(LEDEffects, { depth: null });

    const data: TExportData =
      // {
      //   position: TPositionData
      //   control: TControlData
      //   dancer: TDancerData[]
      //   color: TColorData
      //   LEDEffects: TExportLED
      // }
      { position, control, dancer, color, LEDEffects };
    // console.log(data)
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(data));
  } catch (err) {
    res.status(404).send({ err });
  }
};

export default exportData;