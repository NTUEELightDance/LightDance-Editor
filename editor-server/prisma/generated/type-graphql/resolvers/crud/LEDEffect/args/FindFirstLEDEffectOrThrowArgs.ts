import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { LEDEffectOrderByWithRelationInput } from "../../../inputs/LEDEffectOrderByWithRelationInput";
import { LEDEffectWhereInput } from "../../../inputs/LEDEffectWhereInput";
import { LEDEffectWhereUniqueInput } from "../../../inputs/LEDEffectWhereUniqueInput";
import { LEDEffectScalarFieldEnum } from "../../../../enums/LEDEffectScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstLEDEffectOrThrowArgs {
  @TypeGraphQL.Field(_type => LEDEffectWhereInput, {
    nullable: true
  })
  where?: LEDEffectWhereInput | undefined;

  @TypeGraphQL.Field(_type => [LEDEffectOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: LEDEffectOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => LEDEffectWhereUniqueInput, {
    nullable: true
  })
  cursor?: LEDEffectWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [LEDEffectScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "name" | "partName" | "repeat" | "frames"> | undefined;
}
