import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { Ctx } from "type-graphql";
import {
  Dancer,
  LEDEffect,
  Part,
} from "../../../prisma/generated/type-graphql";

import prisma from "../../prisma";

type TColor = {
  [key: string]: number[];
};

type TReturnData = {
  [key: string]: TPartData[];
};

type TPartData = {
  start: number;
  fade: boolean;
  status: number[][];
};

type TLEDData = {
  LEDs: number[][];
  fade: boolean;
  start: number;
};

const getDancerLEDData = async (req: Request, res: Response) => {
  try {
    const dancer = req.query.dancer as string;
    if (!dancer) throw new Error("Dancer name is required.");

    const colors = await prisma.color.findMany({});
    const colorDict: TColor = {};
    colors.map((color) => {
      colorDict[color.id.toString()] = color.colorCode;
    });

    const dancerData = await prisma.dancer.findUniqueOrThrow({
      where: { name: dancer },
      select: {
        parts: {
          where: { type: "LED" },
          select: {
            name: true,
            length: true,
            controlData: {
              select: {
                value: true,
                frame: {
                  select: {
                    start: true,
                    fade: true,
                  },
                },
              },
              orderBy: {
                frame: {
                  start: "asc",
                },
              },
            },
          },
        },
      },
    });
    const ret: TReturnData = {};
    const parts = dancerData.parts;

    await Promise.all(
      parts.map(async (part: any) => {
        const partData: TPartData[] = [];
        const name = part.name;
        const length = part.length;
        const controlData = part.controlData as Prisma.JsonArray;

        const ledDict: { [key: string]: LEDEffect } = {};
        const ledEffects = await prisma.lEDEffect.findMany({
          where: { partName: name },
        });
        ledEffects.map((ledEffect) => {
          ledDict[ledEffect.id.toString()] = ledEffect;
        });

        let last = 0;

        ret[name] = controlData?.reduce<TPartData[]>((ori, control: any) => {
          const newControl = ori;
          const { src } = control.value as {
            src: number;
          };
          const start = control.frame?.start;
          const frameFade = control.frame?.fade;
          if (src === -1) {
            if (start > last)
              newControl.push({
                start: start,
                fade: frameFade,
                status: Array(length).fill([0, 0, 0, 0]),
              });
            return newControl;
          }
          const led = ledDict[src.toString()];
          const { repeat, frames }: { repeat: number; frames: TLEDData[] } =
            led as any;
          frames.sort((frame1, frame2) => {
            return frame1.start - frame2.start;
          });

          const duration = frames[frames.length - 1].start + 1;
          Array.from(Array(repeat + 1).keys()).map((t) => {
            frames.map((frame) => {
              const fade = frame.fade;
              const frameStart = frame.start;
              const LEDs = frame.LEDs;

              const status = LEDs.map((led) => {
                const color = led[0];
                const alpha = led[1];

                // Get color of LEDs
                const rgb = colorDict[color.toString()];
                if (!rgb) return [0, 0, 0, alpha];
                else return [...rgb, alpha];
              });

              newControl.push({
                start: start + duration * t + frameStart,
                fade,
                status,
              });
            });
          });
          last = start + duration * (repeat + 1);

          return newControl;
        }, partData);
      })
    );

    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(ret));
  } catch (err: any) {
    res.status(404).send({ err: err.message });
  }
};

export default getDancerLEDData;
