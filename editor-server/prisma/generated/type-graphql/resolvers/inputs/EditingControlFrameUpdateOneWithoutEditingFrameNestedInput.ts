import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateOrConnectWithoutEditingFrameInput } from "../inputs/EditingControlFrameCreateOrConnectWithoutEditingFrameInput";
import { EditingControlFrameCreateWithoutEditingFrameInput } from "../inputs/EditingControlFrameCreateWithoutEditingFrameInput";
import { EditingControlFrameUpdateWithoutEditingFrameInput } from "../inputs/EditingControlFrameUpdateWithoutEditingFrameInput";
import { EditingControlFrameUpsertWithoutEditingFrameInput } from "../inputs/EditingControlFrameUpsertWithoutEditingFrameInput";
import { EditingControlFrameWhereUniqueInput } from "../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingControlFrameUpdateOneWithoutEditingFrameNestedInput", {
  isAbstract: true
})
export class EditingControlFrameUpdateOneWithoutEditingFrameNestedInput {
  @TypeGraphQL.Field(_type => EditingControlFrameCreateWithoutEditingFrameInput, {
    nullable: true
  })
  create?: EditingControlFrameCreateWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateOrConnectWithoutEditingFrameInput, {
    nullable: true
  })
  connectOrCreate?: EditingControlFrameCreateOrConnectWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameUpsertWithoutEditingFrameInput, {
    nullable: true
  })
  upsert?: EditingControlFrameUpsertWithoutEditingFrameInput | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameWhereUniqueInput, {
    nullable: true
  })
  connect?: EditingControlFrameWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameUpdateWithoutEditingFrameInput, {
    nullable: true
  })
  update?: EditingControlFrameUpdateWithoutEditingFrameInput | undefined;
}
