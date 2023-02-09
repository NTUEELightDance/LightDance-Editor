import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { ControlFrame } from "../models/ControlFrame";
import { Part } from "../models/Part";

@TypeGraphQL.ObjectType("ControlData", {
  isAbstract: true
})
export class ControlData {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  partId!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  frameId!: number;

  @TypeGraphQL.Field(_type => GraphQLScalars.JSONResolver, {
    nullable: false
  })
  value!: Prisma.JsonValue;

  part?: Part;

  frame?: ControlFrame;
}
