import { Resolver, FieldResolver, Root, Ctx, ResolverInterface } from "type-graphql";

import { IControl, TContext } from "../types/global";
import { Control } from "./types/control";

@Resolver((of) => Control)
export class ControlResolver implements ResolverInterface<Control> {
  @FieldResolver()
  async frame(@Root() control: IControl, @Ctx() ctx: TContext) {
    const data = await ctx.db.ControlFrame.findOne({ _id: control.frame });
    return data;
  }

  @FieldResolver()
  async status(@Root() control: IControl, @Ctx() ctx: TContext) {
    return control.value;
  }
}
