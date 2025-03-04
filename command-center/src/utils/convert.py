from ..types import (
    DancerInfo,
    DancerItem,
    DancerPayload,
    DancerPayloadInterfaceItems,
    DancerStatus,
    FromControllerServerBoardInfo,
)


def update_dancer_status_from_board_info(
    board_info: FromControllerServerBoardInfo, prev_status: DancerStatus
) -> DancerStatus:
    parsed_dancer_payload: DancerPayload = {}
    for board_info_item in board_info.payload.values():
        parsed_dancer_payload.setdefault(board_info_item.dancer, {})[
            board_info_item.interface
        ] = DancerPayloadInterfaceItems(
            board_info_item.IP,
            board_info_item.MAC,
            board_info_item.dancer,
            board_info_item.hostname,
            board_info_item.connected,
        )
    if prev_status:
        return DancerStatus(
            {
                name: DancerItem(
                    selected=item.selected,
                    name=name,
                    hostname=item.hostname,
                    interface=(
                        "ethernet"
                        if board_info.payload[item.ethernet_info.MAC].connected
                        else "wifi"
                    ),
                    ethernet_info=DancerInfo(
                        board_info.payload[item.ethernet_info.MAC].connected,
                        item.ethernet_info.IP,
                        item.ethernet_info.MAC,
                    ),
                    wifi_info=DancerInfo(
                        board_info.payload[item.wifi_info.MAC].connected,
                        item.wifi_info.IP,
                        item.wifi_info.MAC,
                    ),
                    response=item.response,
                )
                for name, item in prev_status.items()
            }
        )
    else:
        return DancerStatus(
            {
                name: DancerItem(
                    selected=False,
                    name=name,
                    hostname=item["wifi"].hostname,
                    interface=("ethernet" if item["ethernet"].connected else "wifi"),
                    ethernet_info=DancerInfo(
                        item["ethernet"].connected,
                        item["ethernet"].IP,
                        item["ethernet"].MAC,
                    ),
                    wifi_info=DancerInfo(
                        item["wifi"].connected, item["wifi"].IP, item["wifi"].MAC
                    ),
                    response="",
                )
                for name, item in parsed_dancer_payload.items()
            }
        )
