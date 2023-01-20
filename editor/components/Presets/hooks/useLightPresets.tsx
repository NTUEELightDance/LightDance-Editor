import { useEffect } from "react";
import { useImmer } from "use-immer";
// states
import { reactiveState } from "core/state";
// type
import { LightPresetsType } from "../presets";
// utils
import { setItem } from "core/utils";

/**
 * LightPresets logic
 */
export default function useLightPresets() {
  const [lightPresets, setLightPresets] = useImmer<LightPresetsType>([]);
  useEffect(() => {
    saveToLocal();
  }, [lightPresets]);
  /**
   * edit a lightPreset's name
   */
  const editLightPresetsName = ({
    name,
    idx,
  }: {
    name: string;
    idx: number;
  }) => {
    setLightPresets((draft) => {
      draft[idx].name = name;
    });
  };
  /**
   * addLightPresets
   */
  const addLightPresets = (name: string) => {
    setLightPresets((draft) => {
      draft.push({ name, status: reactiveState.currentStatus() });
    });
  };
  /**
   * deleteLightPresets
   */
  const deleteLightPresets = (idx: number) => {
    setLightPresets((draft) => {
      draft.splice(idx, 1);
    });
  };
  /**
   * save lightPresets to localStorage
   */
  const saveToLocal = () => {
    setItem("lightPresets", JSON.stringify(lightPresets));
  };

  return {
    lightPresets,
    setLightPresets,
    editLightPresetsName,
    addLightPresets,
    deleteLightPresets,
  };
}
