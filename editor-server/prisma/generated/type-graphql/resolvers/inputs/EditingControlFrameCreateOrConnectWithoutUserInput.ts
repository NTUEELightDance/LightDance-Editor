import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EditingControlFrameCreateWithoutUserInput } from "../inputs/EditingControlFrameCreateWithoutUserInput";
import { EditingControlFrameWhereUniqueInput } from "../inputs/EditingControlFrameWhereUniqueInput";

@TypeGraphQL.InputType("EditingControlFrameCreateOrConnectWithoutUserInput", {
  isAbstract: true
})
export class EditingControlFrameCreateOrConnectWithoutUserInput {
  @TypeGraphQL.Field(_type => EditingControlFrameWhereUniqueInput, {
    nullable: false
  })
  where!: EditingControlFrameWhereUniqueInput;

  @TypeGraphQL.Field(_type => EditingControlFrameCreateWithoutUserInput, {
    nullable: false
  })
  create!: EditingControlFrameCreateWithoutUserInput;
}
