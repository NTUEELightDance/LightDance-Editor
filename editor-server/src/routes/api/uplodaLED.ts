import db from "../../models";

interface LooseObject {
  [key: string]: any;
}

const uploadLED = async (req: any, res: any) => {
  try {
    // read request
    const { data } = req.files;
    const { clear } = req.body;
    const allPart = JSON.parse(data.data.toString("ascii"));

    if (clear == "true") {
      await db.LED.deleteMany();
      console.log("LED db is cleared.");
    }

    await Promise.all(
      Object.keys(allPart).map(async (partName: string) => {
        const effectData = allPart[partName];
        await Promise.all(
          Object.keys(effectData).map(async (effectName: any) => {
            // if overlapped, update the origin one
            await db.LED.deleteOne({ effectName, partName });
            const { effects, repeat } = effectData[effectName];
            await new db.LED({ effects, repeat, effectName, partName }).save();
          })
        );
      })
    );
    res.status(200).end();
  } catch (err) {
    res.status(400).send({ err });
  }
};

export default uploadLED;
