from dataclasses import dataclass
from typing import Dict, List, Literal, Union

from dataclass_wizard import JSONWizard

"""
To controller server
"""


@dataclass
class ToControllerServerBasePayload(JSONWizard):
    dancers: List[str]


@dataclass
class ToControllerServerPlayPayload(JSONWizard):
    dancers: List[str]
    start: int
    timestamp: int


@dataclass
class ToControllerServerColorPayload(JSONWizard):
    dancers: List[str]
    colorCode: str


@dataclass
class ToControllerServerWebShellPayload(JSONWizard):
    dancers: List[str]
    command: str


@dataclass
class ToControllerServerBase(JSONWizard):
    class _(JSONWizard.Meta):
        json_key_to_field = {"__all__": "True", "from": "from_"}

    from_: Literal["controlPanel"]
    statusCode: int


@dataclass
class ToControllerServerBoardInfoPartial(JSONWizard):
    topic: Literal["boardInfo"]


@dataclass
class ToControllerServerBoardInfo(
    ToControllerServerBase, ToControllerServerBoardInfoPartial
):
    pass


@dataclass
class ToControllerServerSyncPartial(JSONWizard):
    topic: Literal["sync"]
    payload: ToControllerServerBasePayload


@dataclass
class ToControllerServerSync(ToControllerServerBase, ToControllerServerSyncPartial):
    pass


@dataclass
class ToControllerServerPlayPartial(JSONWizard):
    topic: Literal["play"]
    payload: ToControllerServerPlayPayload


@dataclass
class ToControllerServerPlay(ToControllerServerBase, ToControllerServerPlayPartial):
    pass


@dataclass
class ToControllerServerPausePartial(JSONWizard):
    topic: Literal["pause"]
    payload: ToControllerServerBasePayload


@dataclass
class ToControllerServerPause(ToControllerServerBase, ToControllerServerPausePartial):
    pass


@dataclass
class ToControllerServerStopPartial(JSONWizard):
    topic: Literal["stop"]
    payload: ToControllerServerBasePayload


@dataclass
class ToControllerServerStop(ToControllerServerBase, ToControllerServerStopPartial):
    pass


@dataclass
class ToControllerServerLoadPartial(JSONWizard):
    topic: Literal["load"]
    payload: ToControllerServerBasePayload


@dataclass
class ToControllerServerLoad(ToControllerServerBase, ToControllerServerLoadPartial):
    pass


@dataclass
class ToControllerServerUploadPartial(JSONWizard):
    topic: Literal["upload"]
    payload: ToControllerServerBasePayload


@dataclass
class ToControllerServerUpload(ToControllerServerBase, ToControllerServerUploadPartial):
    pass


@dataclass
class ToControllerServerRebootPartial(JSONWizard):
    topic: Literal["reboot"]
    payload: ToControllerServerBasePayload


@dataclass
class ToControllerServerReboot(ToControllerServerBase, ToControllerServerRebootPartial):
    pass


@dataclass
class ToControllerServerTestPartial(JSONWizard):
    topic: Literal["test"]
    payload: ToControllerServerColorPayload


@dataclass
class ToControllerServerTest(ToControllerServerBase, ToControllerServerTestPartial):
    pass


@dataclass
class ToControllerServerColorPartial(JSONWizard):
    topic: Literal["red", "green", "blue", "yellow", "magenta", "cyan"]
    payload: ToControllerServerBasePayload


@dataclass
class ToControllerServerColor(ToControllerServerBase, ToControllerServerColorPartial):
    pass


@dataclass
class ToControllerServerDarkAllPartial(JSONWizard):
    topic: Literal["darkAll"]


@dataclass
class ToControllerServerDarkAll(
    ToControllerServerBase, ToControllerServerDarkAllPartial
):
    pass


@dataclass
class ToControllerServerCloseGPIOPartial(JSONWizard):
    topic: Literal["close"]
    payload: ToControllerServerBasePayload


@dataclass
class ToControllerServerCloseGPIO(
    ToControllerServerBase, ToControllerServerCloseGPIOPartial
):
    pass


@dataclass
class ToControllerServerWebShellPartial(JSONWizard):
    topic: Literal["webShell"]
    payload: ToControllerServerWebShellPayload


@dataclass
class ToControllerServerWebShell(
    ToControllerServerBase, ToControllerServerWebShellPartial
):
    pass


"""
From controller server
"""


@dataclass
class DancerDataItem(JSONWizard):
    class _(JSONWizard.Meta):
        json_key_to_field = {"__all__": "True", "IP": "IP", "MAC": "MAC"}

    IP: str
    MAC: str
    dancer: str
    hostname: str
    connected: bool
    interface: Literal["wifi", "ethernet"]


@dataclass
class FromControllerServerBase(JSONWizard):
    from_: Literal["server"]
    topic: str
    statusCode: int


FromControllerServerBoardInfoPayload = Dict[str, DancerDataItem]


@dataclass
class FromControllerServerBoardInfo(FromControllerServerBase):
    class _(JSONWizard.Meta):
        json_key_to_field = {"__all__": "True", "from": "from_"}

    topic: Literal["boardInfo"]
    payload: FromControllerServerBoardInfoPayload


@dataclass
class FromControllerServerCommandResponsePayload(JSONWizard):
    command: str
    message: str
    dancer: str


@dataclass
class FromControllerServerCommandResponse(FromControllerServerBase):
    class _(JSONWizard.Meta):
        json_key_to_field = {"__all__": "True", "from": "from_"}

    topic: Literal["command"]
    payload: FromControllerServerCommandResponsePayload


ToControllerServer = Union[
    ToControllerServerBoardInfo,
    ToControllerServerCloseGPIO,
    ToControllerServerColor,
    ToControllerServerDarkAll,
    ToControllerServerLoad,
    ToControllerServerPause,
    ToControllerServerPlay,
    ToControllerServerReboot,
    ToControllerServerStop,
    ToControllerServerSync,
    ToControllerServerTest,
    ToControllerServerUpload,
    ToControllerServerWebShell,
]

ToControllerServerPartial = Union[
    ToControllerServerBoardInfoPartial,
    ToControllerServerCloseGPIOPartial,
    ToControllerServerColorPartial,
    ToControllerServerDarkAllPartial,
    ToControllerServerLoadPartial,
    ToControllerServerPausePartial,
    ToControllerServerPlayPartial,
    ToControllerServerRebootPartial,
    ToControllerServerStopPartial,
    ToControllerServerSyncPartial,
    ToControllerServerTestPartial,
    ToControllerServerUploadPartial,
    ToControllerServerWebShellPartial,
]

FromControllerServer = Union[
    FromControllerServerBoardInfo, FromControllerServerCommandResponse
]

# a = FromControllerServerBoardInfo.from_json("""{"from": "server", "topic": "boardInfo", "statusCode": 0, "payload": {}}""")
# print(a.to_dict())
