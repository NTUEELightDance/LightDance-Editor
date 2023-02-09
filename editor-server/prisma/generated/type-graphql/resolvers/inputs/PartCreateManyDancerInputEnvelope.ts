import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PartCreateManyDancerInput } from "../inputs/PartCreateManyDancerInput";

@TypeGraphQL.InputType("PartCreateManyDancerInputEnvelope", {
  isAbstract: true
})
export class PartCreateManyDancerInputEnvelope {
  @TypeGraphQL.Field(_type => [PartCreateManyDancerInput], {
    nullable: false
  })
  data!: PartCreateManyDancerInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
