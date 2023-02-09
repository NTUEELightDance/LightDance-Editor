import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { ControlFrame } from "../models/ControlFrame";
import { User } from "../models/User";

@TypeGraphQL.ObjectType("EditingControlFrame", {
  isAbstract: true
})
export class EditingControlFrame {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  userId!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  frameId?: number | null;

  user?: User;

  editingFrame?: ControlFrame | null;
}
