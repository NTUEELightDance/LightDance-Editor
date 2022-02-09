import {
  Resolver,
  Ctx,
  Arg,
  Query,
  Mutation,
  PubSub,
  Publisher,
} from "type-graphql";
import { PosData } from "./types/posData";
import { Map } from "./types/map";
import { EditPositionInput } from "./inputs/position";
import { Topic } from "./subscriptions/topic";
import { generateID } from "../utility";
import {
  PositionMapPayload,
  PositionMapMutation,
} from "./subscriptions/positionMap";
import { updateRedisPosition } from "../utility";
import {
  PositionRecordPayload,
  PositionRecordMutation,
} from "./subscriptions/positionRecord";

@Resolver((of) => Map)
export class PosMapResolver {
  @Query((returns) => Map)
  async PosMap(@Ctx() ctx: any) {
    let frames = await ctx.db.PositionFrame.find();
    const id = frames.map((frame: any) => {
      return { id: frame.id, _id: frame._id };
    });
    return { frames: id };
  }
}

@Resolver((of) => PosData)
export class EditPosMapResolver {
  @Mutation((returns) => Map)
  async editPosMap(
    @PubSub(Topic.PositionRecord)
    publishPositionRecord: Publisher<PositionRecordPayload>,
    @PubSub(Topic.PositionMap) publish: Publisher<PositionMapPayload>,
    @Arg("positionData", (type) => [EditPositionInput])
    positionData: EditPositionInput[],
    @Arg("start") startTime: number,
    @Ctx() ctx: any
  ) {
    // find a position frame
    const positionFrame = await ctx.db.PositionFrame.findOne({
      start: startTime,
    });

    // if position frame not found
    if (!positionFrame) {
      const newPositionFrame = await new ctx.db.PositionFrame({
        start: startTime,
        id: generateID(),
      });

      // check payload
      const dancers = await ctx.db.Dancer.find();
      if (positionData.length !== dancers.length) {
        throw new Error("Not all dancer in payload");
      }
      await Promise.all(
        positionData.map(async (data: any) => {
          const { dancerName, positionData } = data;
          const dancer = await ctx.db.Dancer.findOne({ name: dancerName });
          if (!dancer) {
            throw new Error("Dancer not found");
          }
        })
      );

      // add new positions
      await Promise.all(
        positionData.map(async (data: any) => {
          const { dancerName, positionData } = data;
          // create new position for every dancer
          let newPosition = new ctx.db.Position({
            frame: newPositionFrame,
            x: positionData.x,
            y: positionData.y,
            z: positionData.z,
            id: generateID(),
          });
          await newPosition.save();

          // push
          await ctx.db.Dancer.findOneAndUpdate(
            { name: dancerName },
            {
              $push: {
                positionData: newPosition,
              },
            }
          );
        })
      );
      await newPositionFrame.save();
      // subscription
      const mapPayload: PositionMapPayload = {
        mutation: PositionMapMutation.CREATED,
        editBy: ctx.userID,
        frameID: newPositionFrame.id,
        frames: [{ _id: newPositionFrame._id, id: newPositionFrame.id }],
      };
      await publish(mapPayload);

      const allPositionFrames = await ctx.db.PositionFrame.find().sort({
        start: 1,
      });
      let index = -1;
      await allPositionFrames.map((frame: any, idx: number) => {
        if (frame.id === newPositionFrame.id) {
          index = idx;
        }
      });
      await updateRedisPosition(newPositionFrame.id)

      const recordPayload: PositionRecordPayload = {
        mutation: PositionRecordMutation.CREATED,
        editBy: ctx.userID,
        frameID: newPositionFrame.id,
        index,
      };
      await publishPositionRecord(recordPayload);
      return {
        frames: [{ _id: newPositionFrame._id, id: newPositionFrame.id }],
      };
    }

    // if position frame found
    else {
      const { editing, _id, id: frameID } = positionFrame;
      if (editing !== ctx.userID) {
        throw new Error("The frame is now editing by other user.");
      }

      // check payload
      const dancers = await ctx.db.Dancer.find();
      if (positionData.length !== dancers.length) {
        throw new Error("Not all dancer in payload");
      }
      await Promise.all(
        positionData.map(async (data: any) => {
          const { dancerName } = data;
          const dancer = await ctx.db.Dancer.findOne({ name: dancerName });
          if (!dancer) {
            throw new Error("Dancer not found");
          }
        })
      );

      // updata positions
      await Promise.all(
        positionData.map(async (data: any) => {
          const { dancerName, positionData } = data;
          const dancer = await ctx.db.Dancer.findOne({
            name: dancerName,
          }).populate("positionData");

          dancer.positionData.map(async (position: any) => {
            if (position.frame.toString() === _id.toString()) {
              await ctx.db.Position.updateOne(
                { _id: position._id },
                { x: positionData.x, y: positionData.y, z: positionData.z }
              );
            }
          });
        })
      );

      // positionframe editing cancel
      await ctx.db.PositionFrame.updateOne({ id: frameID }, { editing: null });

      await updateRedisPosition(frameID)
      // subscription
      const payload: PositionMapPayload = {
        mutation: PositionMapMutation.UPDATED,
        editBy: ctx.userID,
        frameID,
        frames: [{ _id, id: frameID }],
      };
      await publish(payload);
      return { frames: [{ _id, id: frameID }] };
    }
  }
}
