import {
  Resolver,
  Ctx,
  Query,
  Mutation,
  PubSub,
  Publisher,
  Arg,
} from "type-graphql";
import { Map } from "./types/map";
import { ControlData } from "./types/controlData" 
import { EditControlInput } from "./inputs/control";
import { Topic } from "./subscriptions/topic";
import {
  ControlMapPayload,
  ControlMapMutation,
} from "./subscriptions/controlMap";
import { updateRedisControl } from "../utility"

interface LooseObject {
  [key: string]: any;
}

@Resolver((of) => Map)
export class ControlMapResolver {
  @Query((returns) => Map)
  async ControlMap(@Ctx() ctx: any) {
    let frames = await ctx.db.ControlFrame.find();
    const id = frames.map((frame: any) => {
      return { id: frame.id, _id: frame._id };
    });
    return { frames: id };
  }
}

@Resolver((of)=> ControlData)
export class EditControlMapResolver
{
  @Mutation((returns) => ControlData)
  async editControlMap(
    @PubSub(Topic.ControlMap) publish: Publisher<ControlMapPayload>,
    @Arg("controlDatas", (type) => [EditControlInput])
    controlDatas: EditControlInput[],
    @Arg("frameID") frameID: string,
    @Ctx() ctx: any
  ) {
    const { editing, _id } = await ctx.db.ControlFrame.findOne({ id: frameID });
    if (editing !== ctx.userID) {
      throw new Error("The frame is now editing by other user.");
    }
    await Promise.all(
      controlDatas.map(async (data: any) => {
        const { dancerName, controlDatas } = data;
        const dancer = await ctx.db.Dancer.findOne({
          name: dancerName,
        }).populate({
          path: "parts",
          populate: {
            path: "controlData",
            match: {frame: _id}
          }
        });
        await Promise.all(
          controlDatas.map(async (data: any) => {
            const { partName, ELValue, color, src, alpha } = data;
            const wanted = dancer.parts.find(
              (part: any) => part.name === partName
            );
            if (!wanted) throw new Error(`part ${partName} not found`)
            const { controlData, type } = wanted
            const { value, _id } = controlData[0];
            if (type === "FIBER") {
              if (color) {
                const { colorCode } = await ctx.db.Color.findOne({ color });
                value.color = colorCode;
              }
              if (alpha) {
                value.alpha = alpha;
              }
            } else if (type === "EL") {
              if (ELValue) {
                value.value = ELValue;
              }
            } else if (type === "LED") {
              if (src) {
                value.src = src;
              }
              if (alpha) {
                value.alpha = alpha;
              }
            }
            await ctx.db.Control.updateOne({ _id }, { value });
          })
        );
      })
    );
    await ctx.db.ControlFrame.updateOne({ id: frameID }, { editing: null });
    await updateRedisControl(frameID)
    const payload: ControlMapPayload = {
      mutation: ControlMapMutation.UPDATED,
      editBy: ctx.userID,
      frameID,
      frame: [{ _id, id: frameID }],
    };
    await publish(payload);
    return { frame: { _id, id: frameID }};
  }
}