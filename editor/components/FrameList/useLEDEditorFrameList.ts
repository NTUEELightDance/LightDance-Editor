import { setCurrentLEDIndex } from "core/actions";
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";

export default function useLEDEditorFrameList() {
  const currentLEDIndex = useReactiveVar(reactiveState.currentLEDIndex);
  const currentLEDEffect = useReactiveVar(reactiveState.currentLEDEffect);
  const currentLEDEffectStart = useReactiveVar(
    reactiveState.currentLEDEffectStart
  );

  const handleSelectItem = (index: number) => {
    setCurrentLEDIndex({
      payload: index,
    });
  };

  return {
    loading: currentLEDEffect === null,
    frames: currentLEDEffect
      ? currentLEDEffect.effects.map((effect) => ({
          start: effect.start + currentLEDEffectStart,
          id: effect.start.toString(),
        }))
      : [],
    currentIndex: currentLEDIndex,
    handleSelectItem,
  };
}
