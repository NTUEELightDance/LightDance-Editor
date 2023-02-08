import { Request, Response } from "express";
// import { stringify } from "csv-stringify/sync";

// import db from "../../models";
// import { ILogger } from "../../types/global";

// TODO: Implement this
const exportLogger = async (req: Request, res: Response) => {
  // try {
  //   const loggers = await db.Logger.find().sort({ time: -1 });
  //   const rows = [
  //     ["Time", "FieldName", "User", "Status", "ID", "Variable Values"],
  //   ];
  //   loggers.forEach((logger: ILogger) => {
  //     const { time, fieldName, user, status, variableValues } = logger;
  //     const _id = logger._id!;
  //     rows.push([
  //       time.toLocaleString(),
  //       fieldName,
  //       user,
  //       status,
  //       _id.toString(),
  //       JSON.stringify(variableValues),
  //     ]);
  //   });
  //   const output = stringify(rows);
  //   res.setHeader("content-type", "application/csv");
  //   res.setHeader("content-disposition", "attachment; filename=logger.csv");
  //   res.send(output);
  // } catch (err) {
  //   res.status(404).send({ err });
  // }
  res.status(404).send({ err: "Not implemented" });
};

export default exportLogger;
