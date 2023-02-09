import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { EffectListDataCreatecontrolFramesInput } from "../inputs/EffectListDataCreatecontrolFramesInput";
import { EffectListDataCreatedancerDataInput } from "../inputs/EffectListDataCreatedancerDataInput";
import { EffectListDataCreatepositionFramesInput } from "../inputs/EffectListDataCreatepositionFramesInput";

@TypeGraphQL.InputType("EffectListDataCreateManyInput", {
  isAbstract: true
})
export class EffectListDataCreateManyInput {
  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  id?: number | undefined;

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
  description?: string | undefined;

  @TypeGraphQL.Field(_type => EffectListDataCreatedancerDataInput, {
    nullable: true
  })
  dancerData?: EffectListDataCreatedancerDataInput | undefined;

  @TypeGraphQL.Field(_type => EffectListDataCreatecontrolFramesInput, {
    nullable: true
  })
  controlFrames?: EffectListDataCreatecontrolFramesInput | undefined;

  @TypeGraphQL.Field(_type => EffectListDataCreatepositionFramesInput, {
    nullable: true
  })
  positionFrames?: EffectListDataCreatepositionFramesInput | undefined;
}
