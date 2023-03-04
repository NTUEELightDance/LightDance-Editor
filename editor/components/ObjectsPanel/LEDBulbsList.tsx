import { reactiveState } from "@/core/state";
import { useReactiveVar } from "@apollo/client";

function LEDBulbsList() {
  const selectedLEDs = useReactiveVar(reactiveState.selectedLEDs);
  return <div>{JSON.stringify(selectedLEDs, null, 2)}</div>;
}

export default LEDBulbsList;
