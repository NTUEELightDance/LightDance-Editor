// actions and states
import { setCurrentPosIndex } from "core/actions";
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";

// hooks
import usePos from "hooks/usePos";

export default function usePosFrameList() {
  const currentPosIndex = useReactiveVar(reactiveState.currentPosIndex);

  const { loading: posLoading, posMap, posRecord } = usePos();

  // select
  const handleSelectItem = (index: number) => {
    setCurrentPosIndex({
      payload: index,
    });
  };

  return {
    loading: posLoading,
    frames: posRecord.map((frameID) => ({
      start: posMap[frameID].start,
      id: frameID,
    })),
    currentIndex: currentPosIndex,
    handleSelectItem,
  };
}
