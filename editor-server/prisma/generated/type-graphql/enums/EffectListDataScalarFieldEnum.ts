import * as TypeGraphQL from "type-graphql";

export enum EffectListDataScalarFieldEnum {
  id = "id",
  start = "start",
  end = "end",
  description = "description",
  dancerData = "dancerData",
  controlFrames = "controlFrames",
  positionFrames = "positionFrames"
}
TypeGraphQL.registerEnumType(EffectListDataScalarFieldEnum, {
  name: "EffectListDataScalarFieldEnum",
  description: undefined,
});
