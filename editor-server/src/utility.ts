import { nanoid } from "nanoid";

import "dotenv-defaults/config";
import redis from "./redis";
import prisma from "./prisma";

import {
  LooseObject,
  TRedisPos,
  TPartControl,
  TRedisControl,
  TPositionPos,
  TRedisPosition,
} from "./types/global";

const REDIS_CTRL_PREFIX = process.env.REDIS_CTRL_PREFIX || "CTRLFRAME_";
const REDIS_POS_PREFIX = process.env.REDIS_POS_PREFIX || "POSFRAME_";

const initData = async () => {
  await prisma.user.deleteMany();
};

const initRedisControl = async () => {
  const frames = await prisma.controlFrame.findMany({
    include: {
      editing: {
        include: {
          user: true,
        },
      },
    },
  });

  const result: LooseObject = {};

  const allDancers = await prisma.dancer.findMany({
    include: {
      parts: {
        include: {
          controlData: true,
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });

  frames.map(({ id, start, fade, editing }) => {
    const redisKey = REDIS_CTRL_PREFIX + id;

    const status: TPartControl[][] = allDancers.map((dancer) => {
      const { parts } = dancer;
      return parts.map((part) => {
        const { type, controlData } = part;
        // console.log(frameID, part.id)
        // search for frameID
        const wanted = controlData.find(
          // IControl
          (data) => data.frameId === id
        );
        if (!wanted) throw new Error(`ControlData ${id} not found`);

        const value: any = wanted.value;
        if (type === "FIBER") {
          return [value.color, value.alpha];
          // partData.push([value.color, value.alpha]);
        } else if (type === "LED") {
          return [value.src, value.alpha];
          // partData.push([value.src, value.alpha]);
        } else {
          return [value.value];
          // partData.push([value.value]);
        }
      });
    });

    const resultObj: TRedisControl = {
      fade,
      start,
      editing: editing?.user.name,
      status,
    };
    result[redisKey] = JSON.stringify(resultObj);
  });
  if (Object.keys(result).length !== 0) {
    // console.log(result)
    await redis.mSet(result);
  }
  console.log("Redis done initializing ControlMap");
};

const initRedisPosition = async () => {
  const frames = await prisma.positionFrame.findMany({
    include: {
      editing: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });
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

  frames.map(({ id, start, editing }) => {
    const redisKey = `POSFRAME_${id}`;

    const pos: TPositionPos[] = allDancers.map((dancer) => {
      const { positionData } = dancer;
      const wanted: any = positionData.find((data) => data.frameId === id);
      return [wanted.x, wanted.y, wanted.z];
    });

    const resultObj: TRedisPosition = {
      start,
      editing: editing?.user.name,
      pos,
    };
    result[redisKey] = JSON.stringify(resultObj);
  });

  if (Object.keys(result).length !== 0) {
    // console.log(result)
    await redis.mSet(result);
  }
  console.log("Redis done initializing PositionMap");
};

const updateRedisControl = async (id: number) => {
  const controlFrame = await prisma.controlFrame.findUnique({
    where: {
      id,
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
        (data) => data.frameId === id
      );
      if (!wanted) throw new Error(`ControlData ${id} not found`);
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

  const cacheObj: TRedisControl = {
    fade,
    start,
    editing: editing?.user.name,
    status,
  };
  await redis.set(REDIS_CTRL_PREFIX + id, JSON.stringify(cacheObj));
};

const updateRedisPosition = async (id: number) => {
  // id format: 'POSFRAME_${frameID}'
  const positionFrame = await prisma.positionFrame.findUnique({
    where: {
      id,
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
      const wanted: any = positionData.find((data) => data.frameId === id);
      pos.push([wanted.x, wanted.y, wanted.z]);
    });

  const cacheObj: TRedisPosition = {
    start,
    editing: editing?.user.name,
    pos,
  };
  await redis.set(REDIS_POS_PREFIX + id, JSON.stringify(cacheObj));
};

const getRedisControl = async (id: number) => {
  const cache = await redis.get(REDIS_CTRL_PREFIX + id);
  if (cache) {
    const cacheObj: TRedisControl = JSON.parse(cache);
    delete cacheObj.editing;
    return cacheObj;
  } else {
    throw new Error(`Frame ${id} not found in redis.`);
  }
};

const getRedisPosition = async (id: number) => {
  const cache = await redis.get(REDIS_POS_PREFIX + id);
  if (cache) {
    const cacheObj: TRedisPosition = JSON.parse(cache);
    delete cacheObj.editing;
    return cacheObj;
  } else {
    throw new Error(`Frame ${id} not found in redis.`);
  }
};

const deleteRedisControl = async (id: number) => {
  await redis.del(REDIS_CTRL_PREFIX + id);
};

const deleteRedisPosition = async (id: number) => {
  await redis.del(REDIS_POS_PREFIX + id);
};

const generateID = () => {
  const id = nanoid(10); //=> "V1StGXR8_Z5jdHi6B-myT"
  return id;
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
  getRedisControl,
  getRedisPosition,
  deleteRedisControl,
  deleteRedisPosition,
};
