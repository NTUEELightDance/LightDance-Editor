import { nanoid } from "nanoid";
import { ObjectId } from "mongoose";

import model from "./models";
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
  TRedisControlStatus,
  TRedisControl,
} from "./types/global";

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
      const status: TRedisControlStatus = {};
      await Promise.all(
        // dancer: IDancer
        allDancers.map(async (dancer) => {
          const { name, parts } = dancer;
          const partData: LooseObject = {};
          await Promise.all(
            // IPart
            parts.map(async (part) => {
              const { name, type, controlData } = part;
              // search for frameID
              const wanted = controlData.find(
                // IControl
                (data) => data.frameId === parseInt(frameID)
              );
              if (!wanted) throw new Error(`ControlData ${frameID} not found`);

              const { value } = wanted;
              partData[name] = value;
            })
          );
          status[name] = partData;
        })
      );
      const resultObj: TRedisControl = {
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
      const pos: TRedisPos = {};
      await Promise.all(
        // IDancer
        allDancers.map(async (dancer) => {
          const { name, positionData } = dancer;
          const wanted: any = positionData.find(
            (data) => data.frameId === parseInt(frameID)
          );
          pos[name] = { x: wanted.x, y: wanted.y, z: wanted.z };
          // pos[name] = wanted
        })
      );
      const resultObj = { start, editing, pos };
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
  const controlFrame = await model.ControlFrame.findOne({
    id,
  });
  if (!controlFrame) {
    return;
  }
  const { fade, start, editing, _id } = controlFrame;
  const allDancers = await model.Dancer.find().populate({
    path: "parts",
    populate: {
      path: "controlData",
      match: { frame: _id },
    },
  });
  // const frameID = new ObjectId(id)
  const status: TRedisControlStatus = {};
  await Promise.all(
    allDancers.map(async (dancer: IDancer) => {
      const { name, parts } = dancer;
      const partData: LooseObject = {};
      await Promise.all(
        parts.map(async (part: IPart) => {
          const { name, type, controlData } = part;
          const wanted = controlData[0];
          if (!wanted) throw new Error(`ControlData ${_id} not found`);
          const { value } = wanted;
          if (type === "LED") {
            partData[name] = value;
          } else if (type === "FIBER") {
            partData[name] = value;
            // const color = await model.Color.findOne({
            //   color: partData[name].color,
            // });
            // if (color) {
            //   const { colorCode } = color;
            //   partData[name].color = colorCode;
            // }
          } else {
            partData[name] = value.value;
          }
        })
      );
      status[name] = partData;
    })
  );
  const cacheObj = { fade, start, editing, status };
  await redis.set(id, JSON.stringify(cacheObj));
};

const updateRedisPosition = async (id: string) => {
  const positionFrame = await model.PositionFrame.findOne({ id });
  if (!positionFrame) {
    return;
  }
  const { start, editing, _id } = positionFrame;
  const allDancers = await model.Dancer.find().populate("positionData");
  const pos: TRedisPos = {};
  await Promise.all(
    allDancers.map(async (dancer: IDancer) => {
      const { name, positionData } = dancer;
      const wanted = positionData.find(
        (data: IPosition) => data.frame.toString() === _id.toString()
      );
      pos[name] = { x: wanted.x, y: wanted.y, z: wanted.z };
    })
  );
  const cacheObj = { start, editing, pos };
  await redis.set(id, JSON.stringify(cacheObj));
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
};
