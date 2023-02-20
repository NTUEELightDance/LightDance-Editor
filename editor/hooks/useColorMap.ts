import { useReactiveVar } from "@apollo/client";

import { reactiveState } from "@/core/state";
import { notification } from "@/core/utils";

import { colorAgent } from "@/api";

import { isColorCode } from "@/core/models";

export default function useColorMap() {
  const colorMap = useReactiveVar(reactiveState.colorMap);

  const validateColorCode = (colorCode: string) =>
    /^#[0-9a-f]{6}/i.test(colorCode);

  const { loading: colorLoading, error: colorError } = useQuery(GET_COLOR_MAP, {
    onCompleted: (data) => {
      setColorMap({ payload: data.colorMap?.colorMap || {} });
    },
  });

  const [addColor, { loading: addColorLoading, error: addColorError }] =
    useMutation(ADD_COLOR);

  const [editColor, { loading: editColorLoading, error: editColorError }] =
    useMutation(EDIT_COLOR);

  const [deleteColor, { loading: delColorLoading, error: delColorError }] =
    useMutation(DELETE_COLOR);

  const handleAddColor = async (color: string, colorCode: string) => {
    if (!isColorCode(colorCode)) {
      notification.error(`Invalid color code: ${colorCode}`);
      return;
    }
    try {
      await colorAgent.addColor(color, colorCode);
      notification.success(`Successfully added color: ${color}`);
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
    }
  };

  const handleEditColorCode = async (color: string, colorCode: string) => {
    if (!isColorCode(colorCode)) {
      notification.error(`Invalid color code: ${colorCode}`);
      return;
    }

    try {
      await colorAgent.editColorCode(color, colorCode);
      notification.success(`Successfully edited color: ${color}`);
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
    }
  };

  const handleDeleteColor = async (color: string) => {
    try {
      await colorAgent.deleteColor(color);
      notification.success(`Successfully deleted color: ${color}`);
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
    }
  };

  return {
    colorMap,
    handleAddColor,
    handleEditColor: handleEditColorCode,
    handleDeleteColor,
  };
}
