import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateOrConnectWithoutEditingFrameInput } from "../inputs/EditingPositionFrameCreateOrConnectWithoutEditingFrameInput";
import { EditingPositionFrameCreateWithoutEditingFrameInput } from "../inputs/EditingPositionFrameCreateWithoutEditingFrameInput";
import { EditingPositionFrameUpdateWithoutEditingFrameInput } from "../inputs/EditingPositionFrameUpdateWithoutEditingFrameInput";
import { EditingPositionFrameUpsertWithoutEditingFrameInput } from "../inputs/EditingPositionFrameUpsertWithoutEditingFrameInput";
import { EditingPositionFrameWhereUniqueInput } from "../inputs/EditingPositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingPositionFrameUpdateOneWithoutEditingFrameNestedInput", {
  isAbstract: true
})
export class EditingPositionFrameUpdateOneWithoutEditingFrameNestedInput {
  @TypeGraphQL.Field(_type => EditingPositionFrameCreateWithoutEditingFrameInput, {
    nullable: true
  })
  create?: EditingPositionFrameCreateWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateOrConnectWithoutEditingFrameInput, {
    nullable: true
  })
  connectOrCreate?: EditingPositionFrameCreateOrConnectWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameUpsertWithoutEditingFrameInput, {
    nullable: true
  })
  upsert?: EditingPositionFrameUpsertWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: EditingPositionFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameUpdateWithoutEditingFrameInput, {
    nullable: true
  })
  update?: EditingPositionFrameUpdateWithoutEditingFrameInput | undefined;
}
