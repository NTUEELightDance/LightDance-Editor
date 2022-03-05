import db from "../../models";

interface LooseObject {
  [key: string]: any;
}

const exportLED = async (req: any, res: any) => {
  try {
    const allPart = await db.Part.find({ type: "LED" });
    const result: LooseObject = {};
    await Promise.all(
      allPart.map(async (partObj: any) => {
        const partName = partObj.name;
        const part: LooseObject = {};
        const allEffect = await db.LED.find({ partName });
        allEffect.map((effect: any) => {
          const { effectName, repeat, effects } = effect;
          part[effectName] = { repeat, effects };
        });
        result[partName] = part;
      })
    );
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(result));
  } catch (err) {
    res.status(404).send({ err });
  }
};

export default exportLED;
