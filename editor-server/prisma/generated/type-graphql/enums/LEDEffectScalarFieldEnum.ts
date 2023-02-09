import * as TypeGraphQL from "type-graphql";

export enum LEDEffectScalarFieldEnum {
  id = "id",
  name = "name",
  partName = "partName",
  repeat = "repeat",
  frames = "frames"
}
TypeGraphQL.registerEnumType(LEDEffectScalarFieldEnum, {
  name: "LEDEffectScalarFieldEnum",
  description: undefined,
});
