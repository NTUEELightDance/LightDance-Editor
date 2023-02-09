import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { Part } from "../models/Part";
import { PositionData } from "../models/PositionData";
import { DancerCount } from "../resolvers/outputs/DancerCount";

@TypeGraphQL.ObjectType("Dancer", {
  isAbstract: true
})
export class Dancer {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  parts?: Part[];

  positionData?: PositionData[];

  @TypeGraphQL.Field(_type => DancerCount, {
    nullable: true
  })
  _count?: DancerCount | null;
}
