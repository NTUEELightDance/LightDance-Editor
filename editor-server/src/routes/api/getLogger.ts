import {Request, Response} from "express";

// import db from "../../models";

// TODO: Implement this
const getLogger = async (req: Request, res: Response) => {
  // try {
  //   const { id } = req.query;
  //   const result = await db.Logger.findById(id);
  //   res.send(result);
  // } catch (err) {
  //   res.status(404).send({ err });
  // }
  res.status(404).send({ err: "Not implemented" });
};

export default getLogger;
