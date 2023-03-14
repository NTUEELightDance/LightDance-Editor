import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";
import NormalEditButtons from "./NormalEditButtons";
import LEDEditButton from "./LEDEditButtons";

function EditButton() {
  const editor = useReactiveVar(reactiveState.editor);

  if (editor === "LED_EDITOR") {
    return <LEDEditButton />;
  } else {
    return <NormalEditButtons />;
  }
}

export default EditButton;
