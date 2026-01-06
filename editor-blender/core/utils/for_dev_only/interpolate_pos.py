# from ....core.models import Time, Location, MapID, Position, Rotation

# PosHistory = list[tuple[MapID, Time, Position]]

# Weight = int
# PosInterpolateData = tuple[Position, Weight]


# def flattened_pos(position: Position):
#     flattened_location = position.location.__dict__
#     flattened_rotation = position.rotation.__dict__
#     flattened_position = {**flattened_location, **flattened_rotation}
#     return flattened_position


# def interpolate_pos(
#     left_data: PosInterpolateData, right_data: PosInterpolateData, frame: int
# ):
#     left_pos, left_time = left_data
#     right_pos, right_time = right_data
#     flattened_left_position = flattened_pos(left_pos)
#     flattened_right_position = flattened_pos(right_pos)

#     location = Location(x=0, y=0, z=0)
#     rotation = Rotation(rx=0, ry=0, rz=0)
#     for attr in ["x", "y", "z", "rx", "ry", "rz"]:
#         left_num = flattened_left_position[attr]
#         right_num = flattened_right_position[attr]

#         left_weight = float(frame - left_time)
#         right_weight = float(right_time - frame)

#         mid_num = (left_num * right_weight + right_num * left_weight) / (
#             left_weight + right_weight
#         )

#         if attr in ["x", "y", "z"]:
#             setattr(location, attr, mid_num)
#         else:
#             setattr(rotation, attr, mid_num)

#     return Position(location=location, rotation=rotation)


# def is_interpolation_of_pos(last_three_not_none_pos: PosHistory):
#     EPSILON = 0.1
#     position_list = [position[2] for position in last_three_not_none_pos]
#     frame_list = [position[1] for position in last_three_not_none_pos]

#     # dict[str, int] is [x, y, z, rx, ry, rz]
#     #
#     flattened_position_list: list[dict[str, int]] = []
#     for position in position_list:
#         flattened_location = position.location.__dict__
#         flattened_rotation = position.rotation.__dict__
#         flattened_position = {**flattened_location, **flattened_rotation}
#         flattened_position_list.append(flattened_position)

#     for attr in ["x", "y", "z", "rx", "ry", "rz"]:
#         left_dist = flattened_position_list[1][attr] - flattened_position_list[0][attr]
#         right_dist = flattened_position_list[2][attr] - flattened_position_list[1][attr]

#         left_weight = float(frame_list[1] - frame_list[0])
#         right_weight = float(frame_list[2] - frame_list[1])

#         left_handside = left_dist * right_weight
#         right_handside = right_dist * left_weight

#         if abs(left_handside - right_handside) > EPSILON:
#             return False
#     return True
