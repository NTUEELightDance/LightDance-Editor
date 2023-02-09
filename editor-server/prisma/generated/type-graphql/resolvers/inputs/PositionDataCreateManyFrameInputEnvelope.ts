import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PositionDataCreateManyFrameInput } from "../inputs/PositionDataCreateManyFrameInput";

@TypeGraphQL.InputType("PositionDataCreateManyFrameInputEnvelope", {
  isAbstract: true
})
export class PositionDataCreateManyFrameInputEnvelope {
  @TypeGraphQL.Field(_type => [PositionDataCreateManyFrameInput], {
    nullable: false
  })
  data!: PositionDataCreateManyFrameInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
