import { MiddlewareFn } from "type-graphql";
import model from "../models";

export const AccessMiddleware: MiddlewareFn<any> = async (
  { info, context },
  next
) => {
  const { fieldName, parentType, variableValues } = info;
  try {
    if (info.parentType.name === "Mutation") {
      const result = await next();
      await new context.db.Logger({
        user: context.userID,
        variableValues,
        type: parentType,
        fieldName,
        status: "Success",
        result,
      }).save();
    } else {
      await next();
    }
  } catch (errorMessage) {
    await new model.Logger({
      user: context.userID,
      variableValues,
      type: parentType,
      fieldName,
      status: "Error",
      errorMessage,
    }).save();
    throw errorMessage;
  }
};
