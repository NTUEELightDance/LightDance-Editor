import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateManyPartInputEnvelope } from "../inputs/ControlDataCreateManyPartInputEnvelope";
import { ControlDataCreateOrConnectWithoutPartInput } from "../inputs/ControlDataCreateOrConnectWithoutPartInput";
import { ControlDataCreateWithoutPartInput } from "../inputs/ControlDataCreateWithoutPartInput";
import { ControlDataWhereUniqueInput } from "../inputs/ControlDataWhereUniqueInput";

@TypeGraphQL.InputType("ControlDataCreateNestedManyWithoutPartInput", {
  isAbstract: true
})
export class ControlDataCreateNestedManyWithoutPartInput {
  @TypeGraphQL.Field(_type => [ControlDataCreateWithoutPartInput], {
    nullable: true
  })
  create?: ControlDataCreateWithoutPartInput[] | undefined;

  @TypeGraphQL.Field(_type => [ControlDataCreateOrConnectWithoutPartInput], {
    nullable: true
  })
  connectOrCreate?: ControlDataCreateOrConnectWithoutPartInput[] | undefined;

  @TypeGraphQL.Field(_type => ControlDataCreateManyPartInputEnvelope, {
    nullable: true
  })
  createMany?: ControlDataCreateManyPartInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [ControlDataWhereUniqueInput], {
    nullable: true
  })
  connect?: ControlDataWhereUniqueInput[] | undefined;
}
