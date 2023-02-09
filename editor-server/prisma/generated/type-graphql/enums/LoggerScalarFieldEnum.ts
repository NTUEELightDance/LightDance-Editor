import * as TypeGraphQL from "type-graphql";

export enum LoggerScalarFieldEnum {
  id = "id",
  user = "user",
  variableValue = "variableValue",
  fieldName = "fieldName",
  time = "time",
  status = "status",
  errorMessage = "errorMessage",
  result = "result"
}
TypeGraphQL.registerEnumType(LoggerScalarFieldEnum, {
  name: "LoggerScalarFieldEnum",
  description: undefined,
});
