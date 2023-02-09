import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingPositionFrameCreateWithoutUserInput } from "../inputs/EditingPositionFrameCreateWithoutUserInput";
import { EditingPositionFrameWhereUniqueInput } from "../inputs/EditingPositionFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingPositionFrameCreateOrConnectWithoutUserInput", {
  isAbstract: true
})
export class EditingPositionFrameCreateOrConnectWithoutUserInput {
  @TypeGraphQL.Field(_type => EditingPositionFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingPositionFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => EditingPositionFrameCreateWithoutUserInput, {
    nullable: false
  })
  create!: EditingPositionFrameCreateWithoutUserInput;
}
