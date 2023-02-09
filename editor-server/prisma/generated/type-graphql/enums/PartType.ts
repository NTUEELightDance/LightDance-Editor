import * as TypeGraphQL from "type-graphql";

export enum PartType {
  LED = "LED",
  FIBER = "FIBER"
}
TypeGraphQL.registerEnumType(PartType, {
  name: "PartType",
  description: undefined,
});
