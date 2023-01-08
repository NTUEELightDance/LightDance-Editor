import { Paper } from "@mui/material";
import DancerMode from "./DancerMode";
import PartMode from "./PartMode";

import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";
import { DANCER, PART } from "@/constants";

const LightProps = () => {
  const selectionMode = useReactiveVar(reactiveState.selectionMode);
  return (
    <>
      {selectionMode === DANCER ? (
        <DancerMode />
      ) : selectionMode === PART ? (
        <PartMode />
      ) : (
        <Paper sx={{ width: "100%", height: "100%" }} square />
      )}
    </>
  );
};

export default LightProps;
