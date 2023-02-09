import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Dancer } from "../models/Dancer";
import { PositionFrame } from "../models/PositionFrame";

@TypeGraphQL.ObjectType("PositionData", {
  isAbstract: true
})
export class PositionData {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  dancerId!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  frameId!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Float, {
    nullable: false
  })
  x!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Float, {
    nullable: false
  })
  y!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Float, {
    nullable: false
  })
  z!: number;

  dancer?: Dancer;

  frame?: PositionFrame;
}
