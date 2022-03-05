import { MiddlewareFn } from "type-graphql";

export const AccessMiddleware: MiddlewareFn<any> = async (
  { info, context },
  next
) => {
  const { fieldName, parentType, variableValues } = info;
  try {
    if (info.parentType.name === "Mutation") {
      const start = Date.now();
      await next();
      const resolveTime = Date.now() - start;
      await new context.db.Logger({
        user: context.userID,
        variableValues,
        type: parentType,
        fieldName,
        status: "Success",
      }).save();
    } else {
      await next();
    }
  } catch (errorMessage) {
    await new context.db.Logger({
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
