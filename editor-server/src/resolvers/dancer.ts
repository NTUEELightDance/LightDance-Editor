import {
  Resolver,
  Query,
  Mutation,
  Ctx,
  PubSub,
  Publisher,
  Arg,
} from "type-graphql";
import { Dancer } from "./types/dancer";
import {
  AddDancerInput,
  editDancerInput,
  deleteDancerInput,
} from "./inputs/dancer";
import { PositionFrame } from "./types/positionFrame";
import { Topic } from "./subscriptions/topic";
import { DancerPayload, dancerMutation } from "./subscriptions/dancer";
import { generateID } from "../utility";
import { DancerResponse } from "./response/dancerResponse";
import { initRedis } from "../utility";

@Resolver((of) => Dancer)
export class DancerResolver {
  @Query((returns) => [Dancer])
  async dancer(@Ctx() ctx: any) {
    let dancers = await ctx.db.Dancer.find()
      .populate("parts")
      .populate("positionData");
    return dancers;
  }

  @Mutation((returns) => DancerResponse)
  async addDancer(
    @PubSub(Topic.Dancer) publish: Publisher<DancerPayload>,
    @Arg("dancer") newDancerData: AddDancerInput,
    @Ctx() ctx: any
  ) {
    const existDancer = await ctx.db.Dancer.findOne({
      name: newDancerData.name,
    })
      .populate("positionData")
      .populate("parts");
    if (!existDancer) {
      let newDancer = new ctx.db.Dancer({
        name: newDancerData.name,
        parts: [],
        positionData: [],
        id: generateID(),
      });

      // for each position frame, add empty position data to the dancer
      let allPositionFrames = await ctx.db.PositionFrame.find();
      allPositionFrames.map(async (positionframe: any) => {
        let newPosition = new ctx.db.Position({
          frame: positionframe._id,
          x: 0,
          y: 0,
          z: 0,
        });
        newDancer.positionData.push(newPosition);
        await newPosition.save();
      });
      await initRedis()
      const dancerData = await newDancer.save();
      console.log(dancerData);
      const payload: DancerPayload = {
        mutation: dancerMutation.CREATED,
        editBy: ctx.userID,
        dancerData,
      };
      await publish(payload);

      // save dancer
      return Object.assign(dancerData, { ok: true });
    }
    console.log(existDancer);
    return Object.assign(existDancer, { ok: false, msg: "dancer exists" });
  }

  @Mutation((returns) => DancerResponse)
  async editDancer(
    @Arg("dancer") newDancerData: editDancerInput,
    @Ctx() ctx: any
  ) {
    const { id, name } = newDancerData;
    const newDancer = await ctx.db.Dancer.findOneAndUpdate(
      { id },
      { name },
      { new: true }
    )
      .populate("parts")
      .populate("positionData");
    console.log(newDancer);
    if (newDancer) {
      await initRedis()
      return Object.assign(newDancer, { ok: true });
    }
    return Object.assign(
      { name: "", parts: [], positionData: [], id: "" },
      { ok: false, msg: "dancer doesn't exist" }
    );
  }

  @Mutation((returns) => DancerResponse)
  async deleteDancer(
    @Arg("dancer") newDancerData: deleteDancerInput,
    @Ctx() ctx: any
  ) {
    const { id } = newDancerData;
    const dancer = await ctx.db.Dancer.findOne({ id });
    if (dancer) {
      await Promise.all(
        dancer.parts.map(async (ref: string) => {
          const part = await ctx.db.Part.findOne({ _id: ref });
          console.log(part);
          await Promise.all(
            part.controlData.map(async (ref: string) => {
              await ctx.db.Control.deleteOne({ _id: ref });
            })
          );
          await ctx.db.Part.deleteOne({ _id: ref });
        })
      );
      await ctx.db.Dancer.deleteOne({ id });
      await initRedis()
      return Object.assign(dancer, { ok: true });
    }
    return Object.assign(
      { name: "", parts: [], positionData: [], id: "" },
      { ok: false, msg: "dancer doesn't exist" }
    );
  }
}
