import db from "../../models";

const getLogger = async (req: any, res: any) => {
  try {
    const { id } = req.query;
    const result = await db.Logger.findById(id);
    res.send(result);
  } catch (err) {
    res.status(404).send({ err });
  }
};

export default getLogger;
