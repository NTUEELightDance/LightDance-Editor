import bcrypt from "bcrypt";
import "dotenv-defaults/config";
import { nanoid } from "nanoid";

import redis from "./redis";
import model from "./models";
import userData from "./data/users.json";

interface LooseObject {
  [key: string]: any;
}

const initData = async () => {
  await model.User.deleteMany();
  const saltRounds = 10;
  await Promise.all(
    userData.map(async (data: any) => {
      const { userID, name, password } = data;
      const newPassword = await bcrypt.hash(password, saltRounds);
      const user = new model.User({ userID, password: newPassword, name });
      await user.save();
    })
  );
};

const initRedisControl = async () => {
  let frames = await model.ControlFrame.find();
  const result: LooseObject = {};
  const value = frames.map((frame: any) => {
    return { id: frame.id, _id: frame._id };
  });
  const allDancers = await model.Dancer.find().populate({
    path: "parts",
    populate: {
      path: "controlData",
    },
  });
  await Promise.all(
    value.map(async (data: any) => {
      const { _id, id } = data;
      // const frameID = new ObjectId(id)
      const { fade, start, editing } = await model.ControlFrame.findById(_id);
      const status: LooseObject = {};
      await Promise.all(
        allDancers.map(async (dancer: any) => {
          const { name, parts } = dancer;
          const partData: LooseObject = {};
          await Promise.all(
            parts.map(async (part: any) => {
              const { name, type, controlData } = part;
              const wanted = controlData.find(
                (data: any) => data.frame.toString() === _id.toString()
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
      const resultObj = { fade, start, editing, status };
      result[id] = JSON.stringify(resultObj);
    })
  );
  if (Object.keys(result).length !== 0) {
    await redis.mSet(result);
  }
  console.log("Redis done initializing ControlMap");
};

const initRedisPosition = async () => {
  let frames = await model.PositionFrame.find();
  const result: LooseObject = {};
  const value = frames.map((frame: any) => {
    return { id: frame.id, _id: frame._id };
  });
  const allDancers = await model.Dancer.find().populate("positionData");
  await Promise.all(
    value.map(async (data: any) => {
      const { _id, id } = data;
      // const frameID = new ObjectId(id)
      const { start, editing } = await model.PositionFrame.findById(_id);
      const pos: LooseObject = {};
      await Promise.all(
        allDancers.map(async (dancer: any) => {
          const { name, positionData } = dancer;
          const wanted = positionData.find(
            (data: any) => data.frame.toString() === _id.toString()
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
  const { fade, start, editing, _id } = await model.ControlFrame.findOne({
    id,
  });
  const allDancers = await model.Dancer.find().populate({
    path: "parts",
    populate: {
      path: "controlData",
      match: { frame: _id },
    },
  });
  // const frameID = new ObjectId(id)
  const status: LooseObject = {};
  await Promise.all(
    allDancers.map(async (dancer: any) => {
      const { name, parts } = dancer;
      const partData: LooseObject = {};
      await Promise.all(
        parts.map(async (part: any) => {
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
  const { start, editing, _id } = await model.PositionFrame.findOne({ id });
  const allDancers = await model.Dancer.find().populate("positionData");
  const pos: LooseObject = {};
  await Promise.all(
    allDancers.map(async (dancer: any) => {
      const { name, positionData } = dancer;
      const wanted = positionData.find(
        (data: any) => data.frame.toString() === _id.toString()
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
