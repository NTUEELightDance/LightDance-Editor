import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { EditingPositionFrame } from "../models/EditingPositionFrame";
import { PositionData } from "../models/PositionData";
import { PositionFrameCount } from "../resolvers/outputs/PositionFrameCount";

@TypeGraphQL.ObjectType("PositionFrame", {
  isAbstract: true
})
export class PositionFrame {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  editing?: EditingPositionFrame | null;

  positionDatas?: PositionData[];

  @TypeGraphQL.Field(_type => PositionFrameCount, {
    nullable: true
  })
  _count?: PositionFrameCount | null;
}
