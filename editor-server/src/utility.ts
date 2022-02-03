import model from "./models";
import "dotenv-defaults/config";
import redis from "./redis"

interface LooseObject {
  [key: string]: any;
}

const initData = async () => {
  await model.User.deleteMany();
};

const initRedis = async ()=> {
  let frames = await model.ControlFrame.find();
  const result: LooseObject = {}
  const value = frames.map((frame: any) => {
    return { id: frame.id, _id: frame._id };
  });
  const allDancers = await model.Dancer.find().populate({
    path: "parts",
    populate: {
    path: "controlData"
    }
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
                  const { name, type, controlData } = part
                  const wanted = controlData.find(
                      (data: any) => data.frame.toString() === _id.toString()
                  );
                  if (!wanted) throw new Error(`ControlData ${_id} not found`)
                  const { value } = wanted
                  if (type === "LED") {
                      partData[name] = value;
                  } else if (type === "FIBER") {
                      partData[name] = value;
                      const { colorCode } = await model.Color.findOne({
                      color: partData[name].color,
                      });
                      partData[name].color = colorCode;
                  } else {
                      partData[name] = value.value;
                  }
                  })
              );
              status[name] = partData;
              })
          );
          const resultObj = { fade, start, editing, status }
          result[id] = JSON.stringify(resultObj);
      })
  );
  if(Object.keys(result).length !== 0){
      await redis.mSet(result)
  }
  console.log("done")
}

const updateRedis = async (id: string) => {
  const { fade, start, editing, _id } = await model.ControlFrame.findOne({id});
  const allDancers = await model.Dancer.find().populate({
    path: "parts",
    populate: {
      path: "controlData",
      match: {frame: _id}
    }
  });
  // const frameID = new ObjectId(id)
  const status: LooseObject = {};
  await Promise.all(
    allDancers.map(async (dancer: any) => {
      const { name, parts } = dancer;
      const partData: LooseObject = {};
      await Promise.all(
        parts.map(async (part: any) => {
          const { name, type, controlData } = part
          const wanted = controlData[0]
          if (!wanted) throw new Error(`ControlData ${_id} not found`)
          const { value } = wanted
          if (type === "LED") {
            partData[name] = value;
          } else if (type === "FIBER") {
            partData[name] = value;
            const { colorCode } = await model.Color.findOne({
              color: partData[name].color,
            });
            partData[name].color = colorCode;
          } else {
            partData[name] = value.value;
          }
        })
      );
      status[name] = partData;
    })
  );
  const cacheObj = { fade, start, editing, status };
  await redis.set(id, JSON.stringify(cacheObj))
}

const generateID = () => {
  var unique = new Date().valueOf();
  return (unique % 1000000000).toString(32);
};

initRedis()

export { initData, generateID, updateRedis, initRedis };
