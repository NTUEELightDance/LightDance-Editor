import db from "../../models";
import { stringify } from "csv-stringify/sync";

interface LooseObject {
  [key: string]: any;
}

const exportLogger = async (req: any, res: any) => {
  try {
    const loggers = await db.Logger.find().sort({ time: -1 });
    const rows = [
      ["Time", "FieldName", "User", "Status", "ID", "Variable Values"],
    ];
    loggers.forEach((logger: any) => {
      const { time, fieldName, user, status, variableValues, _id } = logger;
      rows.push([
        time.toLocaleString(),
        fieldName,
        user,
        status,
        _id,
        JSON.stringify(variableValues),
      ]);
    });
    const output = stringify(rows);
    res.setHeader("content-type", "application/csv");
    res.setHeader("content-disposition", "attachment; filename=logger.csv");
    res.send(output);
  } catch (err) {
    res.status(404).send({ err });
  }
};

export default exportLogger;
