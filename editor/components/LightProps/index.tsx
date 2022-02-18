import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";
import { DANCER, PART } from "constants";
import DancerMode from "./DancerMode";
import PartMode from "./PartMode";

const LightProps = () => {
  const selectionMode = useReactiveVar(reactiveState.selectionMode);
  return (
    <>
      {selectionMode === DANCER ? (
        <DancerMode />
      ) : selectionMode === PART ? (
        <PartMode />
      ) : (
        <></>
      )}
    </>
  );
};

export default LightProps;
