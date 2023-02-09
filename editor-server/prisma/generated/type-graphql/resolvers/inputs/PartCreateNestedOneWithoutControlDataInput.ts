import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateOrConnectWithoutControlDataInput } from "../inputs/PartCreateOrConnectWithoutControlDataInput";
import { PartCreateWithoutControlDataInput } from "../inputs/PartCreateWithoutControlDataInput";
import { PartWhereUniqueInput } from "../inputs/PartWhereUniqueInput";

@TypeGraphQL.InputType("PartCreateNestedOneWithoutControlDataInput", {
  isAbstract: true
})
export class PartCreateNestedOneWithoutControlDataInput {
  @TypeGraphQL.Field(_type => PartCreateWithoutControlDataInput, {
    nullable: true
  })
  create?: PartCreateWithoutControlDataInput | undefined;

  @TypeGraphQL.Field(_type => PartCreateOrConnectWithoutControlDataInput, {
    nullable: true
  })
  connectOrCreate?: PartCreateOrConnectWithoutControlDataInput | undefined;

  @TypeGraphQL.Field(_type => PartWhereUniqueInput, {
    nullable: true
  })
  connect?: PartWhereUniqueInput | undefined;
}
