import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateManyPartInput } from "../inputs/ControlDataCreateManyPartInput";

@TypeGraphQL.InputType("ControlDataCreateManyPartInputEnvelope", {
  isAbstract: true
})
export class ControlDataCreateManyPartInputEnvelope {
  @TypeGraphQL.Field(_type => [ControlDataCreateManyPartInput], {
    nullable: false
  })
  data!: ControlDataCreateManyPartInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
