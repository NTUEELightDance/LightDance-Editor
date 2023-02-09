import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntFilter } from "../inputs/IntFilter";
import { JsonNullableListFilter } from "../inputs/JsonNullableListFilter";
import { StringNullableFilter } from "../inputs/StringNullableFilter";

@TypeGraphQL.InputType("EffectListDataWhereInput", {
  isAbstract: true
})
export class EffectListDataWhereInput {
  @TypeGraphQL.Field(_type => [EffectListDataWhereInput], {
    nullable: true
  })
  AND?: EffectListDataWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [EffectListDataWhereInput], {
    nullable: true
  })
  OR?: EffectListDataWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [EffectListDataWhereInput], {
    nullable: true
  })
  NOT?: EffectListDataWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  id?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  start?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  end?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => StringNullableFilter, {
    nullable: true
  })
  description?: StringNullableFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableListFilter, {
    nullable: true
  })
  dancerData?: JsonNullableListFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableListFilter, {
    nullable: true
  })
  controlFrames?: JsonNullableListFilter | undefined;

  @TypeGraphQL.Field(_type => JsonNullableListFilter, {
    nullable: true
  })
  positionFrames?: JsonNullableListFilter | undefined;
}
