import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { ControlData } from "../models/ControlData";
import { EditingControlFrame } from "../models/EditingControlFrame";
import { ControlFrameCount } from "../resolvers/outputs/ControlFrameCount";

@TypeGraphQL.ObjectType("ControlFrame", {
  isAbstract: true
})
export class ControlFrame {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: false
  })
  fade!: boolean;

  editing?: EditingControlFrame | null;

  controlDatas?: ControlData[];

  @TypeGraphQL.Field(_type => ControlFrameCount, {
    nullable: true
  })
  _count?: ControlFrameCount | null;
}
