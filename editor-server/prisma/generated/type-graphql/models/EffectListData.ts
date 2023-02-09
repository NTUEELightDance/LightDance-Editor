import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";

@TypeGraphQL.ObjectType("EffectListData", {
  isAbstract: true
})
export class EffectListData {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  id!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  start!: number;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: false
  })
  end!: number;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  description?: string | null;

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: false
  })
  dancerData!: Prisma.JsonValue[];

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: false
  })
  controlFrames!: Prisma.JsonValue[];

  @TypeGraphQL.Field(_type => [GraphQLScalars.JSONResolver], {
    nullable: false
  })
  positionFrames!: Prisma.JsonValue[];
}
