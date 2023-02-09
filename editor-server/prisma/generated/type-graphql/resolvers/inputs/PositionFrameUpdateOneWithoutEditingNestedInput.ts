import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionFrameCreateOrConnectWithoutEditingInput } from "../inputs/PositionFrameCreateOrConnectWithoutEditingInput";
import { PositionFrameCreateWithoutEditingInput } from "../inputs/PositionFrameCreateWithoutEditingInput";
import { PositionFrameUpdateWithoutEditingInput } from "../inputs/PositionFrameUpdateWithoutEditingInput";
import { PositionFrameUpsertWithoutEditingInput } from "../inputs/PositionFrameUpsertWithoutEditingInput";
import { PositionFrameWhereUniqueInput } from "../inputs/PositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("PositionFrameUpdateOneWithoutEditingNestedInput", {
  isAbstract: true
})
export class PositionFrameUpdateOneWithoutEditingNestedInput {
  @TypeGraphQL.Field(_type => PositionFrameCreateWithoutEditingInput, {
    nullable: true
  })
  create?: PositionFrameCreateWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameCreateOrConnectWithoutEditingInput, {
    nullable: true
  })
  connectOrCreate?: PositionFrameCreateOrConnectWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameUpsertWithoutEditingInput, {
    nullable: true
  })
  upsert?: PositionFrameUpsertWithoutEditingInput | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field(_type => PositionFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: PositionFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => PositionFrameUpdateWithoutEditingInput, {
    nullable: true
  })
  update?: PositionFrameUpdateWithoutEditingInput | undefined;
}
