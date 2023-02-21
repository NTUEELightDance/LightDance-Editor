import { Request, Response } from "express";

import prisma from "../../prisma";
import {
  TColorData,
  TControlData,
  TDancerData,
  TExportData,
  TPositionData,
  TExportLED,
  TExportLEDPart,
  TExportLEDFrame,
} from "../../types/global";
import { getRedisControl, getRedisPosition } from "../../utility";

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
            length: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const dancer: TDancerData[] = dancerData.map((dancerObj) => ({
      name: dancerObj.name,
      parts: dancerObj.parts,
    }));

    // console.dir(dancer, { depth: null })

    // grab control data from redis
    const controlFrames = await prisma.controlFrame.findMany();
    const control: TControlData = {};
    await Promise.all(
      controlFrames.map(async (frame) => {
        const { fade, start, status } = await getRedisControl(frame.id);

        const newCacheObj = {
          fade,
          start: Math.floor(start),
          // status: ControlStatus,
          status,
        };
        // console.log(newCacheObj)

        // id(string) or frame.id(number)
        control[frame.id] = newCacheObj;
      })
    );
    // console.dir(control, { depth: null })

    // grab position data from redis
    const positionFrames = await prisma.positionFrame.findMany();
    const position: TPositionData = {};
    await Promise.all(
      positionFrames.map(async (frame) => {
        // id format in redis
        position[frame.id] = await getRedisPosition(frame.id);
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
        });
        // console.dir(LEDPartEffects, { depth: null })
        LEDPartEffects.map((LEDPartEffect) => {
          const { name, repeat, frames } = LEDPartEffect;
          const LEDFrames = frames.map((LEDFrame: any) => {
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
    // console.dir(LEDEffects, { depth: null });

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
