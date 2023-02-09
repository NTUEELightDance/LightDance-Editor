import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { ColorCountAggregate } from "../outputs/ColorCountAggregate";
import { ColorMaxAggregate } from "../outputs/ColorMaxAggregate";
import { ColorMinAggregate } from "../outputs/ColorMinAggregate";

@TypeGraphQL.ObjectType("AggregateColor", {
  isAbstract: true
})
export class AggregateColor {
  @TypeGraphQL.Field(_type => ColorCountAggregate, {
    nullable: true
  })
  _count!: ColorCountAggregate | null;

  @TypeGraphQL.Field(_type => ColorMinAggregate, {
    nullable: true
  })
  _min!: ColorMinAggregate | null;

  @TypeGraphQL.Field(_type => ColorMaxAggregate, {
    nullable: true
  })
  _max!: ColorMaxAggregate | null;
}
