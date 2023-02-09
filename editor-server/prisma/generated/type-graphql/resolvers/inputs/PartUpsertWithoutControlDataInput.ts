import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateWithoutControlDataInput } from "../inputs/PartCreateWithoutControlDataInput";
import { PartUpdateWithoutControlDataInput } from "../inputs/PartUpdateWithoutControlDataInput";

@TypeGraphQL.InputType("PartUpsertWithoutControlDataInput", {
  isAbstract: true
})
export class PartUpsertWithoutControlDataInput {
  @TypeGraphQL.Field(_type => PartUpdateWithoutControlDataInput, {
    nullable: false
  })
  update!: PartUpdateWithoutControlDataInput;

  @TypeGraphQL.Field(_type => PartCreateWithoutControlDataInput, {
    nullable: false
  })
  create!: PartCreateWithoutControlDataInput;
}
