import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateOrConnectWithoutUserInput } from "../inputs/EditingPositionFrameCreateOrConnectWithoutUserInput";
import { EditingPositionFrameCreateWithoutUserInput } from "../inputs/EditingPositionFrameCreateWithoutUserInput";
import { EditingPositionFrameUpdateWithoutUserInput } from "../inputs/EditingPositionFrameUpdateWithoutUserInput";
import { EditingPositionFrameUpsertWithoutUserInput } from "../inputs/EditingPositionFrameUpsertWithoutUserInput";
import { EditingPositionFrameWhereUniqueInput } from "../inputs/EditingPositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingPositionFrameUpdateOneWithoutUserNestedInput", {
  isAbstract: true
})
export class EditingPositionFrameUpdateOneWithoutUserNestedInput {
  @TypeGraphQL.Field(_type => EditingPositionFrameCreateWithoutUserInput, {
    nullable: true
  })
  create?: EditingPositionFrameCreateWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateOrConnectWithoutUserInput, {
    nullable: true
  })
  connectOrCreate?: EditingPositionFrameCreateOrConnectWithoutUserInput | undefined;

  @TypeGraphQL.Field(_type => EditingPositionFrameUpsertWithoutUserInput, {
    nullable: true
  })
  upsert?: EditingPositionFrameUpsertWithoutUserInput | undefined;

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

  @TypeGraphQL.Field(_type => EditingPositionFrameUpdateWithoutUserInput, {
    nullable: true
  })
  update?: EditingPositionFrameUpdateWithoutUserInput | undefined;
}
