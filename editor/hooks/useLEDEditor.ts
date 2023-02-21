import { reactiveState } from "@/core/state";
import { useReactiveVar } from "@apollo/client";

export default function useLEDEditor() {
  const currentLEDPartName = useReactiveVar(reactiveState.currentLEDPartName);
  const currentLEDEffectName = useReactiveVar(
    reactiveState.currentLEDEffectName
  );
  const currentLEDEffectStart = useReactiveVar(
    reactiveState.currentLEDEffectStart
  );
  const currentLEDEffect = useReactiveVar(reactiveState.currentLEDEffect);

  return {
    currentLEDPartName,
    currentLEDEffectName,
    currentLEDEffectStart,
    currentLEDEffect,
  };
}
