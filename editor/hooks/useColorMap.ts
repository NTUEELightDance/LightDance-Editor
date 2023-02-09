import { useReactiveVar } from "@apollo/client";

import { reactiveState } from "@/core/state";
import { notification } from "@/core/utils";

import { colorAgent } from "@/api";

import { isColorCode } from "@/core/models";

export default function useColorMap() {
  const colorMap = useReactiveVar(reactiveState.colorMap);

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
