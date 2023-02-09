import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlFrameCreateOrConnectWithoutEditingInput } from "../inputs/ControlFrameCreateOrConnectWithoutEditingInput";
import { ControlFrameCreateWithoutEditingInput } from "../inputs/ControlFrameCreateWithoutEditingInput";
import { ControlFrameUpdateWithoutEditingInput } from "../inputs/ControlFrameUpdateWithoutEditingInput";
import { ControlFrameUpsertWithoutEditingInput } from "../inputs/ControlFrameUpsertWithoutEditingInput";
import { ControlFrameWhereUniqueInput } from "../inputs/ControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("ControlFrameUpdateOneWithoutEditingNestedInput", {
  isAbstract: true
})
export class ControlFrameUpdateOneWithoutEditingNestedInput {
  @TypeGraphQL.Field(_type => ControlFrameCreateWithoutEditingInput, {
    nullable: true
  })
  create?: ControlFrameCreateWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameCreateOrConnectWithoutEditingInput, {
    nullable: true
  })
  connectOrCreate?: ControlFrameCreateOrConnectWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameUpsertWithoutEditingInput, {
    nullable: true
  })
  upsert?: ControlFrameUpsertWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field(_type => ControlFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: ControlFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => ControlFrameUpdateWithoutEditingInput, {
    nullable: true
  })
  update?: ControlFrameUpdateWithoutEditingInput | undefined;
}
