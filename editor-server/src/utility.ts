import { nanoid } from "nanoid";
import { ObjectId } from "mongoose";

// import model from "./models";
import { Prisma, PrismaClient } from "@prisma/client";
import "dotenv-defaults/config";
import redis from "./redis";
import prisma from "./prisma";

import {
  LooseObject,
  IControlFrame,
  IDancer,
  IPart,
  IControl,
  IPositionFrame,
  IPosition,
  TRedisPos,
  TPartControl,
  TRedisControl,
  TRedisControlTest,
  TRedisPositionTest,
  TPositionPos,
} from "./types/global";

const prisma = new PrismaClient();

const initData = async () => {
  await prisma.user.deleteMany();
};

const initRedisControl = async () => {
  const frames = await prisma.controlFrame.findMany();
  const result: LooseObject = {};

  // IControlFrame
  const framesValue = frames.map((frame: any) => {
    return { id: `CTRLFRAME_${frame.id}` };
  });
  const allDancers = await prisma.dancer.findMany({
    include: {
      parts: {
        include: {
          controlData: true,
        },
      },
    },
  });
  // console.dir(allDancers, { depth: null })
  await Promise.all(
    framesValue.map(async (data: { id: string }) => {
      const { id } = data;
      const [_, frameID] = id.split("_");
      const controlFrame = await prisma.controlFrame.findUnique({
        where: {
          id: parseInt(frameID),
        },
        include: {
          editing: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!controlFrame) {
        return;
      }
      const { fade, start, editing } = controlFrame;
      const status: TPartControl[][] = [];

      // dancer: IDancer
      allDancers
        .sort((a, b) => {
          return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
        })
        .map((dancer) => {
          const { name, parts } = dancer;
          const partData: TPartControl[] = [];
          // IPart
          parts.map((part) => {
            const { name, type, controlData } = part;
            // console.log(frameID, part.id)
            // search for frameID
            const wanted = controlData.find(
              // IControl
              (data) => data.frameId === parseInt(frameID)
            );
            if (!wanted) throw new Error(`ControlData ${frameID} not found`);

            const value: any = wanted.value;
            if (type === "FIBER") {
              partData.push([value.color, value.alpha]);
            } else if (type === "LED") {
              partData.push([value.src, value.alpha]);
            } else {
              partData.push([value.value]);
            }
          });
          status.push(partData);
        });
      const resultObj: TRedisControlTest = {
        fade,
        start,
        editing: editing?.user.name,
        status,
      };
      result[id] = JSON.stringify(resultObj);
    })
  );
  if (Object.keys(result).length !== 0) {
    // console.log(result)
    await redis.mSet(result);
  }
  console.log("Redis done initializing ControlMap");
};

const initRedisPosition = async () => {
  const frames = await prisma.positionFrame.findMany();
  const result: LooseObject = {};

  // IPositionFrame
  const framesValue = frames.map((frame: any) => {
    return { id: `POSFRAME_${frame.id}` };
  });
  const allDancers = await prisma.dancer.findMany({
    include: {
      positionData: true,
    },
  });
  await Promise.all(
    framesValue.map(async (data: { id: string }) => {
      const { id } = data;
      const [_, frameID] = id.split("_");
      const positionFrame = await prisma.positionFrame.findUnique({
        where: {
          id: parseInt(frameID),
        },
        include: {
          editing: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!positionFrame) {
        return;
      }
      const { start, editing } = positionFrame;
      const pos: TPositionPos[] = [];
      // IDancer
      allDancers
        .sort((a, b) => {
          return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
        })
        .map(async (dancer) => {
          const { name, positionData } = dancer;
          const wanted: any = positionData.find(
            (data) => data.frameId === parseInt(frameID)
          );
          pos.push([wanted.x, wanted.y, wanted.z]);
          // pos[name] = { x: wanted.x, y: wanted.y, z: wanted.z }
          // pos[name] = wanted
        });
      const resultObj: TRedisPositionTest = {
        start,
        editing: editing?.user.name,
        pos,
      };
      result[id] = JSON.stringify(resultObj);
    })
  );
  if (Object.keys(result).length !== 0) {
    // console.log(result)
    await redis.mSet(result);
  }
  console.log("Redis done initializing PositionMap");
};

const updateRedisControl = async (id: string) => {
  // id format: 'CTRLFRAME_${frameID}'
  const [_, frameID] = id.split("_");
  const controlFrame = await prisma.controlFrame.findUnique({
    where: {
      id: parseInt(frameID),
    },
    include: {
      editing: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!controlFrame) {
    return;
  }
  const allDancers = await prisma.dancer.findMany({
    include: {
      parts: {
        include: {
          controlData: true,
        },
      },
    },
  });
  const { fade, start, editing } = controlFrame;

  const status: TPartControl[][] = [];
  allDancers.map((dancer) => {
    const { name, parts } = dancer;
    const partData: TPartControl[] = [];
    parts.map((part) => {
      const { name, type, controlData } = part;
      const wanted = controlData.find(
        // IControl
        (data) => data.frameId === parseInt(frameID)
      );
      if (!wanted) throw new Error(`ControlData ${frameID} not found`);
      const value: any = wanted.value;

      if (type === "FIBER") {
        partData.push([value.color, value.alpha]);
      } else if (type === "LED") {
        partData.push([value.src, value.alpha]);
      } else {
        partData.push([value.value]);
      }
    });

    status.push(partData);
  });

  const cacheObj: TRedisControlTest = {
    fade,
    start,
    editing: editing?.user.name,
    status,
  };
  await redis.set(id, JSON.stringify(cacheObj));
};

const updateRedisPosition = async (id: string) => {
  // id format: 'POSFRAME_${frameID}'
  const [_, frameID] = id.split("_");
  const positionFrame = await prisma.positionFrame.findUnique({
    where: {
      id: parseInt(frameID),
    },
    include: {
      editing: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!positionFrame) {
    return;
  }
  // const allDancers = await model.Dancer.find().populate("positionData")
  const allDancers = await prisma.dancer.findMany({
    include: {
      positionData: true,
    },
  });
  const { start, editing } = positionFrame;
  const pos: TPositionPos[] = [];
  allDancers
    .sort((a, b) => {
      return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
    })
    .map((dancer) => {
      const { name, positionData } = dancer;
<<<<<<< HEAD
      const wanted: any = positionData.find(
        (data) => data.frameId === parseInt(frameID)
=======
      if(!positionData) throw new Error("positionData not found");
      const wanted = positionData.find(
        (data: PositionData) => data.frameId === frameId
>>>>>>> finish controlFrame
      );
      pos.push([wanted.x, wanted.y, wanted.z]);
    });

  const cacheObj: TRedisPositionTest = {
    start,
    editing: editing?.user.name,
    pos,
  };
  await redis.set(id, JSON.stringify(cacheObj));
};

const generateID = () => {
  // const id = nanoid(10); //=> "V1StGXR8_Z5jdHi6B-myT"
  // return id;
  return Math.floor(Math.random() * 1000000000);
};

initRedisControl();
initRedisPosition();

export {
  initData,
  generateID,
  updateRedisControl,
  updateRedisPosition,
  initRedisControl,
  initRedisPosition,
};
