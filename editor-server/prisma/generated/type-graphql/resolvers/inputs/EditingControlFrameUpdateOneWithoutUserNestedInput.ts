import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateOrConnectWithoutUserInput } from "../inputs/EditingControlFrameCreateOrConnectWithoutUserInput";
import { EditingControlFrameCreateWithoutUserInput } from "../inputs/EditingControlFrameCreateWithoutUserInput";
import { EditingControlFrameUpdateWithoutUserInput } from "../inputs/EditingControlFrameUpdateWithoutUserInput";
import { EditingControlFrameUpsertWithoutUserInput } from "../inputs/EditingControlFrameUpsertWithoutUserInput";
import { EditingControlFrameWhereUniqueInput } from "../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingControlFrameUpdateOneWithoutUserNestedInput", {
  isAbstract: true
})
export class EditingControlFrameUpdateOneWithoutUserNestedInput {
  @TypeGraphQL.Field(_type => EditingControlFrameCreateWithoutUserInput, {
    nullable: true
  })
  create?: EditingControlFrameCreateWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateOrConnectWithoutUserInput, {
    nullable: true
  })
  connectOrCreate?: EditingControlFrameCreateOrConnectWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => EditingControlFrameUpsertWithoutUserInput, {
    nullable: true
  })
  upsert?: EditingControlFrameUpsertWithoutUserInput | undefined;

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

  @TypeGraphQL.Field(_type => EditingControlFrameUpdateWithoutUserInput, {
    nullable: true
  })
  update?: EditingControlFrameUpdateWithoutUserInput | undefined;
}
