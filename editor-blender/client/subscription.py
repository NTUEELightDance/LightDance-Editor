import asyncio
from typing import List, Optional

from ..client import Clients, client
from ..client.cache import Modifiers
from ..core.actions.state.color_map import add_color, delete_color, update_color
from ..core.actions.state.control_map import (
    add_control,
    delete_control,
    set_control_record,
)
from ..core.actions.state.pos_map import add_pos, delete_pos, set_pos_record, update_pos
from ..core.models import ID
from ..core.utils.convert import (
    color_query_to_state,
    control_frame_query_to_state,
    control_frame_sub_to_query,
    effect_list_data_sub_to_query,
    pos_frame_query_to_state,
    pos_frame_sub_to_query,
)
from ..graphqls.queries import (
    QueryColorMapData,
    QueryColorMapPayloadItem,
    QueryControlMapData,
    QueryControlRecordData,
    QueryEffectListData,
    QueryPosMapData,
    QueryPosRecordData,
)
from ..graphqls.subscriptions import (
    SUB_COLOR_MAP,
    SUB_CONTROL_MAP,
    SUB_CONTROL_RECORD,
    SUB_EFFECT_LIST,
    SUB_POS_MAP,
    SUB_POS_RECORD,
    SubColorData,
    SubColorMutation,
    SubControlMapData,
    SubControlRecordData,
    SubEffectListData,
    SubEffectListMutation,
    SubPositionMapData,
    SubPositionRecordData,
)


async def sub_pos_record(client: Clients):
    async for data in client.subscribe(SubPositionRecordData, SUB_POS_RECORD):
        print("SubPosRecord:", data)

        async def modifier(posRecord: Optional[QueryPosRecordData]):
            subscriptionData = data["positionRecordSubscription"]

            newPosRecord: List[ID] = []
            if posRecord is not None:
                newPosRecord = posRecord

            index = subscriptionData.index
            addID = subscriptionData.addID
            updateID = subscriptionData.updateID
            deleteID = subscriptionData.deleteID

            if len(addID) > 0:
                newPosRecord = newPosRecord[:index] + addID + newPosRecord[index:]

            if len(updateID) > 0:
                length = len(updateID)
                updateIndex = newPosRecord.index(updateID[0])
                newPosRecord = (
                    newPosRecord[:updateIndex] + newPosRecord[updateIndex + length :]
                )
                newPosRecord = newPosRecord[:index] + updateID + newPosRecord[index:]

            if len(deleteID) > 0:
                newPosRecord = list(filter(lambda id: id not in deleteID, newPosRecord))

            set_pos_record(newPosRecord)

            return newPosRecord

        await client.cache.modify(Modifiers(fields={"positionFrameIDs": modifier}))


# TODO: Implement lazy update
async def sub_pos_map(client: Clients):
    async for data in client.subscribe(SubPositionMapData, SUB_POS_MAP):
        print("SubPosMap:", data)

        async def modifier(posMap: Optional[QueryPosMapData]):
            subscriptionData = data["positionMapSubscription"]

            newPosMap = QueryPosMapData(frameIds={})
            if posMap is not None:
                newPosMap = posMap

            frame = subscriptionData.frame
            createFrames = frame.createFrames
            updateFrames = frame.updateFrames
            deleteFrames = frame.deleteFrames

            for id, posSub in createFrames.items():
                newPosFrame = pos_frame_sub_to_query(posSub)
                new_pos_frame = pos_frame_query_to_state(newPosFrame)

                newPosMap.frameIds[id] = newPosFrame
                add_pos(id, new_pos_frame)

            for id in deleteFrames:
                del newPosMap.frameIds[id]
                delete_pos(id)

            for id, posSub in updateFrames.items():
                newPosFrame = pos_frame_sub_to_query(posSub)
                new_pos_frame = pos_frame_query_to_state(newPosFrame)

                newPosMap.frameIds[id] = newPosFrame
                update_pos(id, new_pos_frame)

            # set_pos_map(pos_map_query_to_state(newPosMap.frameIds))

            return newPosMap

        await client.cache.modify(Modifiers(fields={"PosMap": modifier}))


async def sub_control_record(client: Clients):
    async for data in client.subscribe(SubControlRecordData, SUB_CONTROL_RECORD):
        print("SubControlRecord:", data)

        async def modifier(controlRecord: Optional[QueryControlRecordData]):
            subscriptionData = data["controlRecordSubscription"]

            newControlRecord: List[ID] = []
            if controlRecord is not None:
                newControlRecord = controlRecord

            index = subscriptionData.index
            addID = subscriptionData.addID
            updateID = subscriptionData.updateID
            deleteID = subscriptionData.deleteID

            # TODO: Determine insert method
            if len(addID) > 0:
                newControlRecord = (
                    newControlRecord[:index] + addID + newControlRecord[index:]
                )

            if len(updateID) > 0:
                length = len(updateID)
                updateIndex = newControlRecord.index(updateID[0])
                newControlRecord = (
                    newControlRecord[:updateIndex]
                    + newControlRecord[updateIndex + length :]
                )
                newControlRecord = (
                    newControlRecord[:index] + updateID + newControlRecord[index:]
                )

            if len(deleteID) > 0:
                newControlRecord = list(
                    filter(lambda id: id not in deleteID, newControlRecord)
                )

            set_control_record(newControlRecord)

            return newControlRecord

        await client.cache.modify(Modifiers(fields={"controlFrameIDs": modifier}))


# TODO: Implement lazy update
async def sub_control_map(client: Clients):
    async for data in client.subscribe(SubControlMapData, SUB_CONTROL_MAP):
        print("SubControlMap:", data)

        async def modifier(controlMap: Optional[QueryControlMapData]):
            subscriptionData = data["controlMapSubscription"]

            newControlMap = QueryControlMapData(frameIds={})
            if controlMap is not None:
                newControlMap = controlMap

            frame = subscriptionData.frame
            createFrames = frame.createFrames
            updateFrames = frame.updateFrames
            deleteFrames = frame.deleteFrames

            # NOTE: There's only one modification at a time in fact

            for id, frameSub in createFrames.items():
                newControlFrame = control_frame_sub_to_query(frameSub)
                new_control_frame = control_frame_query_to_state(newControlFrame)

                newControlMap.frameIds[id] = newControlFrame
                add_control(id, new_control_frame)

            for id in deleteFrames:
                del newControlMap.frameIds[id]
                delete_control(id)

            for id, frameSub in updateFrames.items():
                newControlFrame = control_frame_sub_to_query(frameSub)
                new_control_frame = control_frame_query_to_state(newControlFrame)

                newControlMap.frameIds[id] = newControlFrame
                add_control(id, new_control_frame)

            # set_control_map(control_map_query_to_state(newControlMap.frameIds))

            return newControlMap

        await client.cache.modify(Modifiers(fields={"ControlMap": modifier}))


# WARNING: Untested
async def sub_effect_list(client: Clients):
    async for data in client.subscribe(SubEffectListData, SUB_EFFECT_LIST):
        print("SubEffectList:", data)

        async def modifier(effectList: Optional[QueryEffectListData]):
            subscriptionData = data["effectListSubscription"]

            newEffectList: QueryEffectListData = []
            if effectList is not None:
                newEffectList = effectList

            mutation = subscriptionData.mutation
            effectListData = subscriptionData.effectListData

            match mutation:
                case SubEffectListMutation.CREATED:
                    newEffectList.append(effect_list_data_sub_to_query(effectListData))
                case SubEffectListMutation.DELETED:
                    newEffectList = list(
                        filter(lambda item: item.id != effectListData.id, newEffectList)
                    )

            return newEffectList

        await client.cache.modify(Modifiers(fields={"effectList": modifier}))


# TODO: Implement lazy update
async def sub_color_map(client: Clients):
    async for data in client.subscribe(SubColorData, SUB_COLOR_MAP):
        print("SubColorMap:", data)

        async def modifier(colorMap: Optional[QueryColorMapData]):
            subscriptionData = data["colorSubscription"]

            newColorMap = QueryColorMapData(colorMap={})
            if colorMap is not None:
                newColorMap = colorMap

            id = subscriptionData.id
            mutation = subscriptionData.mutation
            color = subscriptionData.color
            colorCode = subscriptionData.colorCode

            match mutation:
                case SubColorMutation.CREATED:
                    if color is None or colorCode is None:
                        return newColorMap
                    newColor = QueryColorMapPayloadItem(
                        color=color, colorCode=colorCode
                    )
                    new_color = color_query_to_state(id, newColor)

                    newColorMap.colorMap[id] = newColor
                    add_color(id, new_color)

                case SubColorMutation.UPDATED:
                    if color is None or colorCode is None:
                        return newColorMap
                    newColor = QueryColorMapPayloadItem(
                        color=color, colorCode=colorCode
                    )
                    new_color = color_query_to_state(id, newColor)

                    newColorMap.colorMap[id] = newColor
                    update_color(id, new_color)

                case SubColorMutation.DELETED:
                    del newColorMap.colorMap[id]
                    delete_color(id)

            return newColorMap

        await client.cache.modify(Modifiers(fields={"colorMap": modifier}))


subscription_task: Optional[asyncio.Task[None]] = None


async def subscribe():
    while True:
        try:
            print("Subscribing...")

            tasks = [
                # asyncio.create_task(sub_pos_record(client)),
                asyncio.create_task(sub_pos_map(client)),
                # asyncio.create_task(sub_control_record(client)),
                asyncio.create_task(sub_control_map(client)),
                asyncio.create_task(sub_effect_list(client)),
                asyncio.create_task(sub_color_map(client)),
            ]

            await asyncio.gather(*tasks)
        except:
            print("Subscription closed.")

        print("Reconnecting subscription...")
        await asyncio.sleep(3)
