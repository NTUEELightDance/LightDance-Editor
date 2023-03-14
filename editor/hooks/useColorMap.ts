import { useReactiveVar } from "@apollo/client";

import { reactiveState } from "@/core/state";
import { notification } from "@/core/utils";

import { colorAgent } from "@/api";

import { Color, ColorID, isColorCode } from "@/core/models";

export default function useColorMap() {
  const colorMap = useReactiveVar(reactiveState.colorMap);

  const handleAddColor = async ({
    name,
    colorCode,
  }: Pick<Color, "name" | "colorCode">) => {
    if (!isColorCode(colorCode)) {
      notification.error(`Invalid color code: ${colorCode}`);
      return;
    }
    try {
      await colorAgent.addColor({ name, colorCode });
      notification.success(`Successfully added color: ${name}`);
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
    }
  };

  const handleEditColorCode = async ({
    name,
    colorCode,
    id,
  }: Pick<Color, "name" | "colorCode" | "id">) => {
    if (!isColorCode(colorCode)) {
      notification.error(`Invalid color code: ${colorCode}`);
      return;
    }

    try {
      await colorAgent.editColorCode({ id, name, colorCode });
      notification.success(`Successfully edited color: ${name}`);
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
    }
  };

  const handleDeleteColor = async (colorID: ColorID) => {
    try {
      await colorAgent.deleteColor(colorID);
      notification.success(
        `Successfully deleted color: ${colorMap[colorID].name}`
      );
    } catch (error) {
      if (error instanceof Error) {
        notification.error(error.message);
      }
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
