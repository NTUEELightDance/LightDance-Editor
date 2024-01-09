import asyncio
from typing import Optional

from ..client import Clients, client
from ..client.cache import Modifiers
from ..core.utils.convert import gql_control_frame_sub_to_query
from ..graphqls import (
    SUB_COLOR_MAP,
    SUB_CONTROL_MAP,
    SUB_CONTROL_RECORD,
    SUB_EFFECT_LIST,
    SUB_POS_MAP,
    SUB_POS_RECORD,
    QueryColorMapData,
    QueryColorMapPayloadItem,
    QueryControlMapData,
    SubColorData,
    SubColorMutation,
    SubControlMapData,
    SubControlRecordData,
    SubEffectListContent,
    SubPositionMapData,
    SubPositionRecordData,
)


async def sub_pos_record(client: Clients):
    async for data in client.subscribe(SubPositionRecordData, SUB_POS_RECORD):
        print("SubPosRecord:", data)

        if client.cache is None:
            continue


async def sub_pos_map(client: Clients):
    async for data in client.subscribe(SubPositionMapData, SUB_POS_MAP):
        print("SubPosMap:", data)

        if client.cache is None:
            continue


async def sub_control_record(client: Clients):
    async for data in client.subscribe(SubControlRecordData, SUB_CONTROL_RECORD):
        print("SubControlRecord:", data)

        if client.cache is None:
            continue


async def sub_control_map(client: Clients):
    async for data in client.subscribe(SubControlMapData, SUB_CONTROL_MAP):
        print("SubControlMap:", data)

        if client.cache is None:
            continue

        async def modifier(controlMap: Optional[QueryControlMapData]):
            subscriptionData = data["controlMapSubscription"]

            newControlMap = QueryControlMapData(frameIds={})

            frame = subscriptionData.frame
            createFrames = frame.createFrames
            updateFrames = frame.updateFrames
            deleteFrames = frame.deleteFrames

            for id, frameSub in createFrames.items():
                newControlMap.frameIds[id] = gql_control_frame_sub_to_query(frameSub)

            for id in deleteFrames:
                del newControlMap.frameIds[id]

            for id, frameSub in updateFrames.items():
                newControlMap.frameIds[id] = gql_control_frame_sub_to_query(frameSub)

            # TODO: Set state

            return newControlMap

        await client.cache.modify(Modifiers(fields={"controlMap": modifier}))


async def sub_effect_list(client: Clients):
    async for data in client.subscribe(SubEffectListContent, SUB_EFFECT_LIST):
        print("SubEffectList:", data)

        if client.cache is None:
            continue


async def sub_color_map(client: Clients):
    async for data in client.subscribe(SubColorData, SUB_COLOR_MAP):
        print("SubColorMap:", data)

        if client.cache is None:
            continue

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

            # TODO: Set state

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
