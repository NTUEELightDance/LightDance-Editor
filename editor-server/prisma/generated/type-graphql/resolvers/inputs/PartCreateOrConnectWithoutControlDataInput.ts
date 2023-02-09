import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateWithoutControlDataInput } from "../inputs/PartCreateWithoutControlDataInput";
import { PartWhereUniqueInput } from "../inputs/PartWhereUniqueInput";

@TypeGraphQL.InputType("PartCreateOrConnectWithoutControlDataInput", {
  isAbstract: true
})
export class PartCreateOrConnectWithoutControlDataInput {
  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: false
  })
  where!: PartWhereUniqueInput;

  @TypeGraphQL.Field(_type => PartCreateWithoutControlDataInput, {
    nullable: false
  })
  create!: PartCreateWithoutControlDataInput;
}
