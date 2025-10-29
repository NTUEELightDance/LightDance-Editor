from functools import partial, reduce
from typing import Callable, cast

try:
    from ....core.models import RGBA
except ImportError:
    RGBA = tuple[int, int, int, int]

ActualRGB = tuple[float, float, float]
Weight = int
InterpolateData = tuple[
    RGBA, Weight
]  # weight ratio = ratio of dist(interpolated value - given value)
_SIMILARITY_EPSILON = (
    0.8  # diff of all primary color between color and similar color must <= EPSILON
)


def _toActualRGB(color: RGBA) -> ActualRGB:
    r, g, b, a = color
    norm_a = a / 255.0
    actual_rgb = r * norm_a, g * norm_a, b * norm_a
    return actual_rgb


def _calc_prim(prim: float, a: int) -> int:
    if a == 0:
        return 0

    prim_float = min(prim * 255.0 / a, 255.0)
    prim_floor = int(prim_float)

    prim_int = prim_floor
    if prim_float - prim_floor > 0.5:
        prim_int = prim_floor + 1
    return prim_int


def _calc_error_if_valid(rgba: RGBA, real_act_rgb: ActualRGB) -> tuple[float, bool]:
    """
    Return False in bool if at least one of |primary color - actual_primary color| > EPSILON. Else, Return True in bool and SSE in float
    """
    rgb = _toActualRGB(rgba)
    zip_two_color = [(rgb[i], real_act_rgb[i]) for i in range(3)]

    is_vaild_similarity = reduce(
        lambda x, y: x and y,
        map(lambda tup: abs(tup[0] - tup[1]) <= _SIMILARITY_EPSILON, zip_two_color),
    )
    if not is_vaild_similarity:
        return 99999.0, False

    error = reduce(
        lambda x, y: x + y, map(lambda tup: (tup[0] - tup[1]) ** 2, zip_two_color)
    )
    return error, True


def _toRGBA(actual_color: ActualRGB) -> RGBA:
    upper_bound_prim_color = max(actual_color)
    min_a = int(upper_bound_prim_color)

    if upper_bound_prim_color <= 1e-3:
        return 0, 0, 0, 0

    # The error is SSE of actual rgb
    min_error = 10.0
    best_rgba = 1, 1, 1, -255
    for a in range(min_a, 256):
        _calc_prim_assigned_a = partial(_calc_prim, a=a)
        rgb = tuple(map(_calc_prim_assigned_a, actual_color))
        rgb = cast(tuple[int, int, int], rgb)
        rgba = rgb + (a,)
        error, is_valid_similarity = _calc_error_if_valid(rgba, actual_color)
        if is_valid_similarity and error < min_error:
            min_error = error
            best_rgba = rgba

    if min_error > 3:
        raise ValueError(f"No valid RGBA can be converted from {actual_color}")

    return best_rgba


def _are_similar(a: RGBA, b_rgb: ActualRGB) -> bool:
    """If two color are similar (has their ActualRGB differ under EPSILON=0.8) or not."""
    actual_a = _toActualRGB(a)

    zip_a_b = [(actual_a[i], b_rgb[i]) for i in range(3)]
    diff_le_epsilon: Callable[[tuple[float, float]], bool] = (
        lambda tup: abs(tup[0] - tup[1]) <= _SIMILARITY_EPSILON
    )
    are_similar_list = map(diff_le_epsilon, zip_a_b)
    return reduce(lambda a, b: a and b, are_similar_list)


def _interpolate_actual_rgb(a: InterpolateData, b: InterpolateData) -> ActualRGB:
    left_rgba, left_weight = a
    right_rgba, right_weight = b

    left_actual_rgb = _toActualRGB(left_rgba)
    right_actual_rgb = _toActualRGB(right_rgba)
    zip_actual_lr = zip(left_actual_rgb, right_actual_rgb)

    if left_weight == 0:
        return left_actual_rgb
    elif right_weight == 0:
        return right_actual_rgb

    interpolate_primary_color = lambda prims: (
        prims[0] * right_weight + prims[1] * left_weight
    ) / (left_weight + right_weight)
    interpolated_actual_rgb = tuple(map(interpolate_primary_color, zip_actual_lr))
    return interpolated_actual_rgb


def interpolate(a: InterpolateData, b: InterpolateData) -> RGBA:
    interpolated_actual_rgb = _interpolate_actual_rgb(a, b)
    return _toRGBA(interpolated_actual_rgb)


def is_interpolation(
    a: InterpolateData, b: InterpolateData, interpolated_color: RGBA
) -> bool:
    """
    Check if interpolated_color is the interpolation of a and b.

    Args:
        a (InterpolateData): left point and weight,
        b (InterpolateData): right point and weight,
        interpolated_color (RGBA): the unsure interpolation of a and b

    Returns:
        bool: if the interpolated_color is interpolation of a and b or not.
    """
    true_interpolated_actual_rgb = _interpolate_actual_rgb(a, b)
    return _are_similar(interpolated_color, true_interpolated_actual_rgb)


if __name__ == "__main__":
    red = 255, 0, 0, 255
    green = 0, 255, 0, 255
    blue = 0, 0, 255, 255
    white = 255, 255, 255, 255
    black = 10, 40, 90, 0

    red_data = red, 10
    green_data = green, 27
    blue_data = blue, 57
    white_data = white, 190
    black_data = black, 250

    # int_black = interpolate(black_data, black_data)
    # print(f"Interpolate Black: {int_black}")
    # print(f"----------Fin-----------\n")

    soft_green_data = green, 10
    soft_blue_data = blue, 10
    # int_act_rg = _interpolate_actual_rgb(red_data, soft_green_data)
    # int_rg = interpolate(red_data, soft_green_data)
    # int_act_gb = _interpolate_actual_rgb(soft_green_data, soft_blue_data)
    # int_gb = interpolate(soft_green_data, soft_blue_data)
    # int_act_rb = _interpolate_actual_rgb(red_data, soft_blue_data)
    # int_rb = interpolate(red_data, soft_blue_data)
    # print(f"RG: {int_act_rg} -> {int_rg}")
    # print(f"GB: {int_act_gb} -> {int_gb}")
    # print(f"RB: {int_act_rb} -> {int_rb}")
    # print(f"----------Fin-----------\n")

    purple = 255, 255, 0, 255
    light_purple = 255, 255, 0, 127
    light_purple_II = 127, 127, 0, 255
    anyway = 123, 230, 9, 235
    print(f"Int RG: {_interpolate_actual_rgb(red_data, soft_green_data)}")
    print(
        f"Int RG and purple are similar? :{is_interpolation(red_data, soft_green_data, purple)}"
    )
    print(
        f"Int RG and light purple are similar? :{is_interpolation(red_data, soft_green_data, light_purple)}"
    )
    print(
        f"Int RG and light purple II are similar? :{is_interpolation(red_data, soft_green_data, light_purple_II)}"
    )
    print(
        f"Int RG and anyway are similar? :{is_interpolation(red_data, soft_green_data, anyway)}"
    )
    print(f"----------Fin-----------\n")

    red = 255, 0, 0, 10
    green = 0, 255, 0, 15
    blue = 0, 0, 255, 25
    red_data = red, 10
    green_data = green, 27
    blue_data = blue, 57
    int_act_rg = _interpolate_actual_rgb(red_data, green_data)
    int_rg = interpolate(red_data, green_data)
    int_act_gb = _interpolate_actual_rgb(green_data, blue_data)
    int_gb = interpolate(green_data, blue_data)
    int_act_rb = _interpolate_actual_rgb(red_data, blue_data)
    int_rb = interpolate(red_data, blue_data)
    print(f"hard RG: {int_act_rg} -> {int_rg}")
    print(f"hard GB: {int_act_gb} -> {int_gb}")
    print(f"hard RB: {int_act_rb} -> {int_rb}")
    print(f"----------Fin-----------\n")

    anyway_data = anyway, 36
    int_act_Ar = _interpolate_actual_rgb(red_data, anyway_data)
    int_Ar = interpolate(red_data, anyway_data)
    int_act_Aw = _interpolate_actual_rgb(white_data, anyway_data)
    int_Aw = interpolate(white_data, anyway_data)
    print(f"hard Anyway R: {int_act_Ar} -> {int_Ar}")
    print(f"hard Anyway W: {int_act_Aw} -> {int_Aw}")
    print(f"----------Fin-----------\n")

# class FormalColor:
#     """
#     A class to express the formal color. The formal color works like a regular color, but its rgba are float and the max of rgb must be 255. Except black, whose rgba are 0.
#     """
#     r: float
#     g: float
#     b: float
#     a: float

#     def __init__(self, r: float, g: float, b: float, a: float):
#         max_color_value = max(r, g, b)

#         ratio: float
#         if a == 0 or _all_be_zero(r, g, b):
#             ratio = 0.0
#         else:
#             ratio = 255.0 / max_color_value

#         self.r = r * ratio
#         self.g = g * ratio
#         self.b = b * ratio
#         self.a = a / ratio if ratio != 0 else 0.0

#     def alpha(self):
#         return self.a / 255.0

#     @classmethod
#     def from_rgb(cls, rgb: RGB):
#         return cls(rgb[0], rgb[1], rgb[2], 255)

#     @classmethod
#     def from_rgba(cls, rgba: RGBA):
#         return cls(rgba[0], rgba[1], rgba[2], rgba[3])

#     @classmethod
#     def from_color(cls, color: Color):
#         return cls.from_rgb(color.rgb)

#     @staticmethod
#     def are_similar(left_color: FormalColor, right_color: FormalColor) -> tuple[bool, float]:
#         """
#         :param left_color:
#         :param right_color:
#         :return: if rgb of two formal color are same, return (True, right.a/left.a) . Else return (False, 0).
#         """
#         left_compare_list = [left_color.r, left_color.g, left_color.b]
#         right_compare_list = [right_color.r, right_color.g, right_color.b]
#         EPSILON = 1E-4

#         for i in range(3):
#             if abs(left_compare_list[i] - right_compare_list[i]) > EPSILON:
#                 return False, 0
#         return True, float(right_color.a) / left_color.a

#     def __add__(self, other):
#         if isinstance(other, FormalColor):
#             new_r = (self.r * self.a + other.r * other.a) / 255.0
#             new_g = (self.g * self.a + other.g * other.a) / 255.0
#             new_b = (self.g * self.a + other.g * other.a) / 255.0
#             return FormalColor(new_r, new_g, new_b, 255.0)
#         else:
#             raise TypeError(f"{type(other)} cannot add FormalColor.")

#     __radd__ = __add__

#     def __mul__(self, other):
#         if isinstance(other, int) or isinstance(other, float):
#             color = deepcopy(self)
#             color.a *= float(other)
#             return color
#         else:
#             raise TypeError(f"{type(other)} cannot multiply by FormalColor.")

#     __rmul__ = __mul__

#     def __str__(self):
#         return f"FormalColor({self.r}, {self.g}, {self.b}, {self.a})"

# if __name__ == '__main__':
#     def anyway_color(rgb: RGB):
#         return Color(1, "", "", rgb)
#     red = anyway_color((255, 0, 0))
#     green = anyway_color((0, 255, 0))
#     blue = anyway_color((0, 0, 255))

#     form_red = FormalColor(255, 0, 0, 255)
#     form_green = FormalColor.from_color(green)
#     form_blue = FormalColor.from_rgb((0, 0, 255))
#     print(f"Red: {form_red}, Green: {form_green}, Blue: {form_blue}")
#     print()
#     form_purple = FormalColor(255, 255, 0, 255)
#     form_light_purple = FormalColor.from_rgb((127, 127, 0))
#     anyway = anyway_color((123, 230, 9))
#     form_anyway = FormalColor.from_color(anyway)
#     print(f"Purple: {form_purple}, Light purple: {form_light_purple}")
#     print(f"Anyway: {anyway}, Form_anyway: {form_anyway}")
#     print(form_anyway.r * form_anyway.alpha(), form_anyway.g * form_anyway.alpha(), form_anyway.b * form_anyway.alpha())
#     print()

#     print(f"Purple and light purple are similar? :{FormalColor.are_similar(form_purple, form_light_purple)}")
#     print(f"Blue and green are similar? :{FormalColor.are_similar(form_blue, form_green)}")

#     print(f"Black: {FormalColor(132, 91, 23, 0)}")
