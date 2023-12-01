import { Request, Response } from "express";

import prisma from "../../prisma";

type TColor = {
  [key: string]: number[];
};

type TPartData = {
  [key: string]: number[];
};

const getDancerFiberData = async (req: Request, res: Response) => {
  try {
    const dancer = req.query.dancer as string;
    if (!dancer) throw new Error("Dancer name is required.");

    const colors = await prisma.color.findMany({});
    const colorDict: TColor = {};
    colors.map((color) => {
      colorDict[color.id.toString()] = color.colorCode;
    });

    const frames = await prisma.controlFrame.findMany({
      orderBy: { start: "asc" },
      select: {
        start: true,
        fade: true,
        controlDatas: {
          select: {
            part: {
              select: {
                name: true,
              },
            },
            value: true,
          },
          where: {
            part: {
              type: "FIBER",
              dancer: {
                name: dancer,
              },
            },
          },
        },
      },
    });
    const result = frames.map((frame) => {
      const { start, fade, controlDatas } = frame;
      const data = { start, fade, status: {} as TPartData };
      controlDatas.map((controlData) => {
        const name = controlData.part.name;
        const { color, alpha } = controlData.value as {
          color: number;
          alpha: number;
        };
        const rgb = colorDict[color.toString()];
        const roundedAlpha = Math.round(alpha);
        if (!rgb) {
          data.status[name] = [0, 0, 0, roundedAlpha];
        } else {
          data.status[name] = [...rgb, roundedAlpha];
        }
      });
      return data;
    });
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(result));
  } catch (err) {
    if (err instanceof Error) res.status(404).send({ err: err.message });
  }
};

export default getDancerFiberData;
