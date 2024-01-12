import asyncio
from typing import List, Optional

from ..client import Clients, client
from ..client.cache import Modifiers
from ..core.actions.state.color_map import set_color_map
from ..core.actions.state.control_map import set_control_map
from ..core.actions.state.pos_map import set_pos_map
from ..core.models import ID
from ..core.utils.convert import (
    color_map_query_to_state,
    control_frame_sub_to_query,
    control_map_query_to_state,
    effect_list_data_sub_to_query,
    pos_frame_sub_to_query,
    pos_map_query_to_state,
)
from ..graphqls.queries import (
    QueryColorMapData,
    QueryColorMapPayloadItem,
    QueryControlMapData,
    QueryControlRecordData,
    QueryEffectListData,
    QueryEffectListItem,
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

            return newPosRecord

        await client.cache.modify(Modifiers(fields={"positionFrameIDs": modifier}))


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
                newPosMap.frameIds[id] = pos_frame_sub_to_query(posSub)

            for id in deleteFrames:
                del newPosMap.frameIds[id]

            for id, posSub in updateFrames.items():
                newPosMap.frameIds[id] = pos_frame_sub_to_query(posSub)

            # await set_pos_map(pos_map_query_to_state(newPosMap))

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

            return newControlRecord

        await client.cache.modify(Modifiers(fields={"controlFrameIDs": modifier}))


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

            for id, frameSub in createFrames.items():
                newControlMap.frameIds[id] = control_frame_sub_to_query(frameSub)

            for id in deleteFrames:
                del newControlMap.frameIds[id]

            for id, frameSub in updateFrames.items():
                newControlMap.frameIds[id] = control_frame_sub_to_query(frameSub)

            # await set_control_map(control_map_query_to_state(newControlMap))

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


async def sub_color_map(client: Clients):
    async for data in client.subscribe(SubColorData, SUB_COLOR_MAP):
        print("SubColorMap:", data)

        async def modifier(colorMap: Optional[QueryColorMapData]):
            subscriptionData = data["colorSubscription"]

            newColorMap = QueryColorMapData(colorMap={})
            if colorMap is not None:
                newColorMap = colorMap

            id = subscriptionData.id
            color = subscriptionData.color
            colorCode = subscriptionData.colorCode
            mutation = subscriptionData.mutation

            match mutation:
                case SubColorMutation.CREATED:
                    newColorMap.colorMap[id] = QueryColorMapPayloadItem(
                        color=color, colorCode=colorCode
                    )

                case SubColorMutation.UPDATED:
                    newColorMap.colorMap[id] = QueryColorMapPayloadItem(
                        color=color, colorCode=colorCode
                    )

                case SubColorMutation.DELETED:
                    del newColorMap.colorMap[id]

            # await set_color_map(color_map_query_to_state(newColorMap))

            return newColorMap

        await client.cache.modify(Modifiers(fields={"colorMap": modifier}))


async def subscribe():
    print("Subscribing...")

    tasks = [
        asyncio.create_task(sub_pos_record(client)),
        asyncio.create_task(sub_pos_map(client)),
        asyncio.create_task(sub_control_record(client)),
        asyncio.create_task(sub_control_map(client)),
        asyncio.create_task(sub_effect_list(client)),
        asyncio.create_task(sub_color_map(client)),
    ]
    await asyncio.gather(*tasks)
