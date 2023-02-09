import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateOrConnectWithoutEditingInput } from "../inputs/PositionFrameCreateOrConnectWithoutEditingInput";
import { PositionFrameCreateWithoutEditingInput } from "../inputs/PositionFrameCreateWithoutEditingInput";
import { PositionFrameWhereUniqueInput } from "../inputs/PositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("PositionFrameCreateNestedOneWithoutEditingInput", {
  isAbstract: true
})
export class PositionFrameCreateNestedOneWithoutEditingInput {
  @TypeGraphQL.Field(_type => PositionFrameCreateWithoutEditingInput, {
    nullable: true
  })
  create?: PositionFrameCreateWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameCreateOrConnectWithoutEditingInput, {
    nullable: true
  })
  connectOrCreate?: PositionFrameCreateOrConnectWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: PositionFrameWhereUniqueInput | undefined;
}
