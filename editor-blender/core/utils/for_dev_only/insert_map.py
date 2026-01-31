import io
import math
import os.path
import pprint
from contextlib import contextmanager
from enum import Enum
from random import randint, random
from typing import Literal, Optional

from ....core.models import (
    ControlMap_MODIFIED,
    ControlMapElement_MODIFIED,
    ControlMapStatus_MODIFIED,
    CtrlData,
    FiberData,
    LEDData,
    Location,
    PartType,
    Position,
    PosMap,
    PosMapElement,
    PosMapStatus,
    Revision,
    Rotation,
)
from ....core.states import state
from ....core.utils.for_dev_only.fifth_dir.file import EOFType, File


class OperationType(Enum):
    FrameOp = 0
    PosOp = 1
    CtrlOp = 2


file_path = os.path.dirname(__file__) + "/fifth_dir/template.txt"
modes = ["fn", "f", "c", "p"]
frames = []
position_frame: PosMap = {}
control_frame: ControlMap_MODIFIED = {}

default_color = list(state.color_map.keys())[2]
default_effect = list(state.led_effect_id_table.keys())[2]
default_fiber = FiberData(color_id=default_color, alpha=255)
default_led = LEDData(effect_id=default_effect, alpha=255)


def default_position(i: int):
    real_i = 1 * (i + 1)
    theta = random() * 6.28
    random_x_unround, random_y_unround = real_i * math.cos(theta), real_i * math.sin(
        theta
    )
    random_x, random_y = round(random_x_unround, 2), round(random_y_unround, 2)

    return Position(
        location=Location(random_x, random_y, 0), rotation=Rotation(0, 0, 0)
    )


@contextmanager
def _read_new_strips(file: File):
    def new_func():
        new_line = file.read_strips()
        if new_line != EOFType.EOF and new_line[0] not in modes:
            return new_line
        else:
            file.revert_strips()
            raise Exception("Get out of here")

    try:
        yield new_func
    except:
        pass


def _random_revision():
    return Revision(meta=randint(1, 300), data=randint(1, 300))


def _create_frames():
    position_frame.clear()
    control_frame.clear()

    for id, start in enumerate(frames):
        pos = {}
        status = {}
        for dancer in state.dancer_names:
            pos[dancer] = None
            status[dancer] = {}
            for part in state.dancers[dancer]:
                status[dancer][part] = None

        position_frame[id] = PosMapElement(start=start, rev=_random_revision(), pos=pos)
        control_frame[id] = ControlMapElement_MODIFIED(
            start=start,
            fade_for_new_status=False,
            rev=_random_revision(),
            status=status,
        )


def _matching(file: File, chr: str):
    dancer_index = -1
    part_index = 0
    match chr:
        case "fn" | "f":
            new_line = file.unsafe_read_strips()
            if not new_line[0].isnumeric:
                raise Exception(
                    f"The line {new_line[0]} is not number, not obeying the rules of fn"
                )

            frames.clear()
            if chr == "fn":
                num = int(new_line[0])
                for i in range(num):
                    frames.append((i + 1) * 1000)
            else:
                for num in new_line:
                    frames.append(int(num))
            _create_frames()

        case "c":
            dancer_index = -1
            part_index = 0
            with _read_new_strips(file) as read_strips:
                while True:
                    new_lines = read_strips()
                    if new_lines[0] == ">":
                        dancer_index += 1
                        part_index = 0
                        continue
                    dancer = state.dancer_names[dancer_index]
                    part = state.dancers[dancer][part_index]

                    if new_lines[0] in ["X", "O", "O-"]:
                        for index, stat in enumerate(new_lines):
                            if stat == "X":
                                continue
                            if dancer_index == -1:
                                control_frame[index].fade_for_new_status = True
                                continue

                            if state.part_type_map[part] == PartType.FIBER:
                                if stat == "O-":
                                    control_frame[index].status[dancer][
                                        part
                                    ] = CtrlData(
                                        part_data=default_fiber, bulb_data=[], fade=True
                                    )
                                else:
                                    control_frame[index].status[dancer][
                                        part
                                    ] = CtrlData(
                                        part_data=default_fiber,
                                        bulb_data=[],
                                        fade=False,
                                    )
                            else:
                                if stat == "O-":
                                    control_frame[index].status[dancer][
                                        part
                                    ] = CtrlData(
                                        part_data=default_led, bulb_data=[], fade=True
                                    )
                                else:
                                    control_frame[index].status[dancer][
                                        part
                                    ] = CtrlData(
                                        part_data=default_led, bulb_data=[], fade=False
                                    )
                    else:
                        fade = False
                        for index in new_lines:
                            fade = False
                            num = index
                            if index[-1] == "-":
                                num = index[:-1]
                                fade = True

                            if dancer_index == -1:
                                control_frame[int(num)].fade_for_new_status = True

                            if state.part_type_map[part] == PartType.FIBER:
                                control_frame[int(num)].status[dancer][part] = CtrlData(
                                    part_data=default_fiber, bulb_data=[], fade=fade
                                )
                            else:
                                control_frame[int(num)].status[dancer][part] = CtrlData(
                                    part_data=default_led, bulb_data=[], fade=fade
                                )

                    part_index += 1
        case "p":
            dancer_index = 0
            with _read_new_strips(file) as read_strips:
                while True:
                    dancer = state.dancer_names[dancer_index]
                    new_lines = read_strips()
                    if new_lines[0] in ["X", "O"]:
                        for index, stat in enumerate(new_lines):
                            if stat == "X":
                                continue
                            position_frame[index].pos[dancer] = default_position(
                                int(index)
                            )

                    else:
                        for index in new_lines:
                            position_frame[int(index)].pos[dancer] = default_position(
                                int(index)
                            )

                    dancer_index += 1


def load_default_map() -> Optional[str]:
    if not os.path.isfile(file_path):
        return "Template file does not exist"

    with open(file_path, "r") as f:
        file = File(f)
        if file.newlines[0] and file.newlines[0][0] == "//OFF":
            return "Template is set to False"

    while True:
        match_line = file.read_strips()
        if match_line is EOFType.EOF:
            break
        _matching(file, match_line[0])

    state.pos_map_MODIFIED = position_frame
    state.control_map_MODIFIED = control_frame

    from ....core.log import logger

    print(f"Pos Map {state.pos_map_MODIFIED}")

    from copy import deepcopy

    test = deepcopy(state.control_map_MODIFIED)
    for id, thing in test.items():
        for dancer, things in state.control_map_MODIFIED[id].status.items():
            for part, thingy in things.items():
                if thingy is None:
                    thing.status[dancer].pop(part)

    print(f"Control Map {test}")


if __name__ == "__main__":
    str = load_default_map()

    print(frames)
    print("----Position Frame----\n")
    pprint.pp(position_frame, indent=2)
    print("----Control Frame----\n")
    pprint.pp(control_frame, indent=2)
