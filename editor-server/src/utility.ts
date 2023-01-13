import { nanoid } from "nanoid";
import { ObjectId } from "mongoose";

import model from "./models";
import "dotenv-defaults/config";
import redis from "./redis";

import { LooseObject, IControlFrame, IDancer, IPart, IControl, IPositionFrame, IPosition, TRedisPos, TRedisControls, TRedisControlStatus, TRedisControl } from "./types/global";

const initData = async () => {
  await model.User.deleteMany();
};

const initRedisControl = async () => {
  const frames = await model.ControlFrame.find();
  const result: LooseObject = {};
  const value = frames.map((frame: IControlFrame) => {
    return { id: frame.id, _id: frame._id! };
  });
  const allDancers = await model.Dancer.find().populate({
    path: "parts",
    populate: {
      path: "controlData",
    },
  });
  await Promise.all(
    value.map(async (data: {id: string, _id: ObjectId}) => {
      const { _id, id } = data;
      // const frameID = new ObjectId(id)
      const controlFrame = await model.ControlFrame.findById(_id);
      if(!controlFrame){
        return;
      }
      const { fade, start, editing } = controlFrame;
      const status: TRedisControlStatus = {};
      await Promise.all(
        allDancers.map(async (dancer: IDancer) => {
          const { name, parts } = dancer;
          const partData: LooseObject = {};
          await Promise.all(
            parts.map(async (part: IPart) => {
              const { name, type, controlData } = part;
              const wanted = controlData.find(
                (data: IControl) => data.frame.toString() === _id.toString()
              );
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
      const resultObj: TRedisControl = { fade, start, editing, status };
      result[id] = JSON.stringify(resultObj);
    })
  );
  if (Object.keys(result).length !== 0) {
    await redis.mSet(result);
  }
  console.log("Redis done initializing ControlMap");
};

const initRedisPosition = async () => {
  const frames = await model.PositionFrame.find();
  const result: LooseObject = {};
  const value = frames.map((frame: IPositionFrame) => {
    return { id: frame.id, _id: frame._id! };
  });
  const allDancers = await model.Dancer.find().populate("positionData");
  await Promise.all(
    value.map(async (data: {id: string, _id: ObjectId}) => {
      const { _id, id } = data;
      // const frameID = new ObjectId(id)
      const positionFrame = await model.PositionFrame.findById(_id);
      if(!positionFrame){
        return;
      }
      const { start, editing } = positionFrame;
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
      const resultObj = { start, editing, pos };
      result[id] = JSON.stringify(resultObj);
    })
  );
  if (Object.keys(result).length !== 0) {
    await redis.mSet(result);
  }
  console.log("Redis done initializing PositionMap");
};

const updateRedisControl = async (id: string) => {
  const controlFrame = await model.ControlFrame.findOne({
    id,
  });
  if (!controlFrame){
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
  if (!positionFrame){
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
