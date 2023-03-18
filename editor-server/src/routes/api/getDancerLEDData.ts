import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { LEDEffect } from "../../../prisma/generated/type-graphql";

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
        let originLED: TLEDData[] = [
          {
            LEDs: Array(length).fill([0, 0, 0, 0]),
            fade: false,
            start: 0,
          },
        ];
        let originRepeat = false;
        let originAlpha = 0;

        ret[name] = controlData?.reduce<TPartData[]>((ori, control: any) => {
          const newControl = ori;
          const { src } = control.value as {
            src: number;
          };
          const frameAlpha = control.value.alpha;
          const frameStart = control.frame?.start;

          if (src === -1) {
            return newControl;
          }

          // insert data
          if (originRepeat) {
            const duration = originLED[originLED.length - 1].start + 1;
            const repeatTime =
              originLED.length === 1
                ? 1
                : Math.ceil((frameStart - last) / duration);
            Array.from(Array(repeatTime).keys()).forEach((t) => {
              originLED.forEach((frame) => {
                const fade = frame.fade;
                const start = frame.start;
                const LEDs = frame.LEDs;
                if (last + duration * t + start >= frameStart) return;

                const status = LEDs.map((led) => {
                  const color = led[0];
                  const tmp = Math.round((led[1] * originAlpha) / 10);
                  const alpha = tmp > 10 ? 15 : tmp;

                  // Get color of LEDs
                  const rgb = colorDict[color.toString()];
                  if (!rgb) return [0, 0, 0, alpha];
                  else return [...rgb, alpha];
                });

                newControl.push({
                  start: last + duration * t + start,
                  fade,
                  status,
                });
              });
            });
          } else {
            originLED.forEach((frame) => {
              const fade = frame.fade;
              const start = frame.start;
              const LEDs = frame.LEDs;
              if (last + start >= frameStart) return;

              const status = LEDs.map((led) => {
                const color = led[0];
                const alpha = Math.round((led[1] * originAlpha) / 10);

                // Get color of LEDs
                const rgb = colorDict[color.toString()];
                if (!rgb) return [0, 0, 0, alpha];
                else return [...rgb, alpha];
              });

              newControl.push({
                start: last + start,
                fade,
                status,
              });
            });
          }

          // TODO: replace old data

          const led = ledDict[src.toString()];
          const { repeat, frames }: { repeat: number; frames: TLEDData[] } =
            led as any;
          frames.sort((frame1, frame2) => {
            return frame1.start - frame2.start;
          });

          last = frameStart;
          originLED = frames;
          originRepeat = repeat === 0;
          originAlpha = frameAlpha;

          return newControl;
        }, partData);
      })
    );

    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(ret));
  } catch (err) {
    if (err instanceof Error) res.status(404).send({ err: err.message });
  }
};

export default getDancerLEDData;
