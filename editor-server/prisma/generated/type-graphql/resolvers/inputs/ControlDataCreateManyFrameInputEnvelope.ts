import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ControlDataCreateManyFrameInput } from "../inputs/ControlDataCreateManyFrameInput";

@TypeGraphQL.InputType("ControlDataCreateManyFrameInputEnvelope", {
  isAbstract: true
})
export class ControlDataCreateManyFrameInputEnvelope {
  @TypeGraphQL.Field(_type => [ControlDataCreateManyFrameInput], {
    nullable: false
  })
  data!: ControlDataCreateManyFrameInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
