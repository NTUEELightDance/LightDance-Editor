import { MiddlewareFn } from "type-graphql";
import { TContext } from "../types/global";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

// TODO: Implement this
export const AccessMiddleware: MiddlewareFn<TContext> = async (
  { info, context },
  next
) => {
  const { fieldName, parentType, variableValues } = info;
  try {
    if (info.parentType.name === "Mutation") {
      const result = await next();
      await prisma.logger.create({
        data: {
          user: context.userId,
          variableValue: variableValues,
          // type: parentType,
          fieldName,
          status: "Success",
          result,
        },
      });
    } else {
      await next();
    }
  } catch (errorMessage) {
    await prisma.logger.create({
      data: {
        user: context.userId,
        variableValue: variableValues,
        // type: parentType,
        fieldName,
        status: "Error",
        errorMessage: { message: String(errorMessage) },
      },
    });
  }
  // await next();
};
