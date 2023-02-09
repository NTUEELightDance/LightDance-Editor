import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { ControlData } from "../models/ControlData";
import { Dancer } from "../models/Dancer";
import { PartType } from "../enums/PartType";
import { PartCount } from "../resolvers/outputs/PartCount";

@TypeGraphQL.ObjectType("Part", {
  isAbstract: true
})
export class Part {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  dancerId!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => PartType, {
    nullable: false
  })
  type!: "LED" | "FIBER";

  dancer?: Dancer;

  controlData?: ControlData[];

  @TypeGraphQL.Field(_type => PartCount, {
    nullable: true
  })
  _count?: PartCount | null;
}
