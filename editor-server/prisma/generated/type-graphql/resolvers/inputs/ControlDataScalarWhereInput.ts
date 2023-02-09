import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { IntFilter } from "../inputs/IntFilter";
import { JsonFilter } from "../inputs/JsonFilter";

@TypeGraphQL.InputType("ControlDataScalarWhereInput", {
  isAbstract: true
})
export class ControlDataScalarWhereInput {
  @TypeGraphQL.Field(_type => [ControlDataScalarWhereInput], {
    nullable: true
  })
  AND?: ControlDataScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataScalarWhereInput], {
    nullable: true
  })
  OR?: ControlDataScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataScalarWhereInput], {
    nullable: true
  })
  NOT?: ControlDataScalarWhereInput[] | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  partId?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => IntFilter, {
    nullable: true
  })
  frameId?: IntFilter | undefined;

  @TypeGraphQL.Field(_type => JsonFilter, {
    nullable: true
  })
  value?: JsonFilter | undefined;
}
