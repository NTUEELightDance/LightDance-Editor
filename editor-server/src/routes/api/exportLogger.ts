import { Request, Response } from "express";
import { Logger } from "../../../prisma/generated/type-graphql";
import prisma from "../../prisma";
import { stringify } from "csv-stringify/sync";

// TODO: Implement this
const exportLogger = async (req: Request, res: Response) => {
  try {
    const loggers = await prisma.logger.findMany({
      orderBy: { time: "desc" },
    });
    const rows = [
      ["Time", "FieldName", "User", "Status", "ID", "Variable Values"],
    ];
    loggers.forEach((logger: Logger) => {
      const { id, time, fieldName, user, status, variableValue } = logger;
      rows.push([
        time.toLocaleString(),
        fieldName,
        user.toString(),
        status,
        id.toString(),
        JSON.stringify(variableValue),
      ]);
    });
    const output = stringify(rows);
    res.setHeader("content-type", "application/csv");
    res.setHeader("content-disposition", "attachment; filename=logger.csv");
    res.send(output);
  } catch (err) {
    res.status(404).send({ err });
  }
  // res.status(404).send({ err: "Not implemented" });
};

export default exportLogger;
