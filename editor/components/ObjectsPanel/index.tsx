import { reactiveState } from "@/core/state";
import { useReactiveVar } from "@apollo/client";
import DancerTree from "./DancerTree";

function ObjectsPanel() {
  const editor = useReactiveVar(reactiveState.editor);

  if (editor === "CONTROL_EDITOR" || editor === "POS_EDITOR") {
    return <DancerTree />;
  } else if (editor === "LED_EDITOR") {
    return <DancerTree />;
  }

  throw new Error("Invalid editor");
}

export default ObjectsPanel;
