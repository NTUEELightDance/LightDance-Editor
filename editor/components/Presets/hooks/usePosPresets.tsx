import { useEffect } from "react";
import { useImmer } from "use-immer";
// states
import { reactiveState } from "core/state";
// type
import { PosPresetsType } from "../presets";
// utils
import { setItem } from "core/utils";

/**
 * PosPresets logic
 */
export default function usePosPresets () {
  const [posPresets, setPosPresets] = useImmer<PosPresetsType>([]);
  useEffect(() => {
    saveToLocal();
  }, [posPresets]);
  /**
   * edit a posPreset's name
   */
  const editPosPresetsName = ({ name, idx }: { name: string, idx: number }) => {
    setPosPresets((draft) => {
      draft[idx].name = name;
    });
  };
    /**
   * addPosPresets
   */
  const addPosPresets = (name: string) => {
    setPosPresets((draft) => {
      draft.push({ name, pos: reactiveState.currentPos() });
    });
  };
    /**
   * deletePosPresets
   */
  const deletePosPresets = (idx: number) => {
    setPosPresets((draft) => {
      draft.splice(idx, 1);
    });
  };
    /**
   * save posPresets to localStorage
   */
  const saveToLocal = () => {
    setItem("posPresets", JSON.stringify(posPresets));
  };

  return {
    posPresets,
    setPosPresets,
    editPosPresetsName,
    addPosPresets,
    deletePosPresets
  };
}
