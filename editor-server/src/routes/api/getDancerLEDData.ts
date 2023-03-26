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
    //* verification
    // check input
    const dancer = req.query.dancer as string;
    if (!dancer) throw new Error("Dancer name is required.");

    //* processing
    // create color map for later usage
    const colors = await prisma.color.findMany({});
    const colorDict: TColor = {};
    colors.map((color) => {
      colorDict[color.id.toString()] = color.colorCode;
    });

    // fetch data & throw error if not found
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

    // deal with each part separately
    await Promise.all(
      parts.map(async (part: any) => {
        const partData: TPartData[] = [];
        const name = part.name;
        const length = part.length;
        const controlData = part.controlData as Prisma.JsonArray;

        // create ledEffect map for later use
        const ledDict: { [key: string]: LEDEffect } = {};
        const ledEffects = await prisma.lEDEffect.findMany({
          where: { partName: name },
        });
        ledEffects.map((ledEffect) => {
          ledDict[ledEffect.id.toString()] = ledEffect;
        });

        // initialize data
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

        // iterate through all frames
        ret[name] = controlData?.reduce<TPartData[]>((ori, control: any) => {
          const newControl: TPartData[] = ori;
          const { src } = control.value as {
            src: number;
          };
          const frameAlpha = control.value.alpha;
          const frameStart = control.frame?.start;

          if (src === -1) {
            return newControl;
          }

          //* insert previous data
          if (originRepeat) {
            // count maximum repeat times
            const duration = originLED[originLED.length - 1].start + 1;
            const repeatTime =
              originLED.length === 1
                ? 1
                : Math.ceil((frameStart - last) / duration);

            // add data
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
            // insert one data
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

          // Remove last frame's frame
          newControl[newControl.length - 1].fade = false;

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

        //* add last data
        if (originRepeat) {
          // count maximum repeat times
          const duration = originLED[originLED.length - 1].start + 1;
          const repeatTime = 10; // TODO: modify max last repeat time

          // add data
          Array.from(Array(repeatTime).keys()).forEach((t) => {
            originLED.forEach((frame) => {
              const fade = frame.fade;
              const start = frame.start;
              const LEDs = frame.LEDs;

              const status = LEDs.map((led) => {
                const color = led[0];
                const tmp = Math.round((led[1] * originAlpha) / 10);
                const alpha = tmp > 10 ? 15 : tmp;

                // Get color of LEDs
                const rgb = colorDict[color.toString()];
                if (!rgb) return [0, 0, 0, alpha];
                else return [...rgb, alpha];
              });

              ret[name].push({
                start: last + duration * t + start,
                fade,
                status,
              });
            });
          });
        } else {
          // insert one data
          originLED.forEach((frame) => {
            const fade = frame.fade;
            const start = frame.start;
            const LEDs = frame.LEDs;

            const status = LEDs.map((led) => {
              const color = led[0];
              const alpha = Math.round((led[1] * originAlpha) / 10);

              // Get color of LEDs
              const rgb = colorDict[color.toString()];
              if (!rgb) return [0, 0, 0, alpha];
              else return [...rgb, alpha];
            });

            ret[name].push({
              start: last + start,
              fade,
              status,
            });
          });
        }

      })
    );

    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(ret));
  } catch (err) {
    if (err instanceof Error) res.status(404).send({ err: err.message });
  }
};

export default getDancerLEDData;
