import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateManyDancerInput } from "../inputs/PositionDataCreateManyDancerInput";

@TypeGraphQL.InputType("PositionDataCreateManyDancerInputEnvelope", {
  isAbstract: true
})
export class PositionDataCreateManyDancerInputEnvelope {
  @TypeGraphQL.Field(_type => [PositionDataCreateManyDancerInput], {
    nullable: false
  })
  data!: PositionDataCreateManyDancerInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
