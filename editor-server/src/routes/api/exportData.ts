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
  TIdColorPair,
  TELControl,
  TLEDControl,
  TFiberControl,
  TIdLEDPair,
  TPositionPos,
} from "../../types/global";
import { getRedisControl, getRedisPosition } from "../../utility";

const exportData = async (req: Request, res: Response) => {
  try {
    // grab color data
    const colorData = await prisma.color.findMany();
    const color: TColorData = {};
    const colorDict: TIdColorPair = {};
    // IColor
    colorData.map((colorObj: any) => {
      color[colorObj.color] = colorObj.colorCode;
      colorDict[colorObj.id.toString()] = colorObj.color;
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
    const LEDDict: TIdLEDPair = {};
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
          const { id, name, repeat, frames } = LEDPartEffect;
          const LEDFrames = frames.map((LEDFrame: any) => {
            const { LEDs, start, fade } = LEDFrame;
            const leds = LEDs.map((led: number[]) => [
              colorDict[led[0].toString()],
              led[1],
            ]);
            const LEDFrameData: TExportLEDFrame = {
              LEDs: leds,
              start,
              fade,
            };
            return LEDFrameData;
          });
          // part[effectName] = { repeat, effects: newEffects }
          LEDPart[name] = { repeat, frames: LEDFrames };
          LEDDict[id.toString()] = name;
        });
        LEDEffects[partName] = LEDPart;
      })
    );

    // grab control data from redis
    const controlFrames = await prisma.controlFrame.findMany();
    const control: TControlData = {};
    await Promise.all(
      controlFrames.map(async (frame) => {
        const { fade, start, status } = await getRedisControl(frame.id);

        const newStatus: (TELControl | TLEDControl | TFiberControl)[][] =
          status.map((dancerStatue, dancerIdx) => {
            return dancerStatue.map((partStatus, partIdx) => {
              const partType = dancer[dancerIdx].parts[partIdx].type;
              if (partType === "FIBER") {
                if (partStatus[0] === -1)
                  return ["", partStatus[1]] as TFiberControl;
                return [
                  colorDict[partStatus[0].toString()],
                  partStatus[1],
                ] as TFiberControl;
              } else {
                if (partStatus[0] === -1)
                  return ["", partStatus[1]] as TLEDControl;
                return [
                  LEDDict[partStatus[0].toString()],
                  partStatus[1],
                ] as TLEDControl;
              }
            });
          });

        const newCacheObj = {
          fade,
          start: Math.floor(start),
          // status: ControlStatus,
          status: newStatus,
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
    Object.entries(position).forEach(([key, { pos, start }]) => {
      position[key] = {
        start,
        pos: pos.map((dancerPos) => {
          return dancerPos.map(
            (partPos) => Math.round((partPos + Number.EPSILON) * 100) / 100
          ) as TPositionPos;
        }),
      };
    });

    const data: TExportData = { position, control, dancer, color, LEDEffects };
    // console.log(data)
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(data));
  } catch (err) {
    res.status(404).send({ err });
  }
};

export default exportData;
