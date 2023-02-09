import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { PositionFrame } from "../models/PositionFrame";
import { User } from "../models/User";

@TypeGraphQL.ObjectType("EditingPositionFrame", {
  isAbstract: true
})
export class EditingPositionFrame {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  userId!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  frameId?: number | null;

  user?: User;

  editingFrame?: PositionFrame | null;
}
