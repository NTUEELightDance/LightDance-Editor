// actions and states
import { setCurrentControlIndex } from "core/actions";
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";

// hooks
import useControl from "hooks/useControl";

export default function useControlFrameList() {
  const currentControlIndex = useReactiveVar(reactiveState.currentControlIndex);

  const { loading: controlLoading, controlMap, controlRecord } = useControl();

  // select
  const handleSelectItem = (index: number) => {
    setCurrentControlIndex({
      payload: index,
    });
  };

  return {
    loading: controlLoading,
    map: controlMap,
    record: controlRecord,
    currentIndex: currentControlIndex,

    handleSelectItem,
  };
}
