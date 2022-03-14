// mui
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useImmer } from "use-immer";

import CommandCenterTable from "./CommandCenterTable";
import CommandControls from "./CommandControls";

// hooks
import useWebsocket from "hooks/useWebsocket";

/**
 * CommandCenter
 */
export default function CommandCenter() {
  // hook
  const { dancerStatus } = useWebsocket();
  const [selectedDancers, setSelectedDancers] = useImmer<string[]>([]); // array of dancerName that is selected

  const handleToggleDancer = (dancerName: string) => {
    setSelectedDancers((draft) => {
      const index = draft.indexOf(dancerName);
      if (index !== -1) draft.splice(index, 1);
      //index == -1 -> not in the array
      else draft.push(dancerName);
    });
  };
  const allChecked = () =>
    selectedDancers.length === Object.keys(dancerStatus).length;
  const handleAllDancer = () => {
    if (allChecked()) {
      // clear all
      setSelectedDancers([]);
    } else {
      // select all
      setSelectedDancers(Object.keys(dancerStatus));
    }
  };

  return (
    <Paper sx={{ p: "2em", minHeight: "100%" }}>
      <Stack gap="2em">
        <CommandControls selectedDancers={selectedDancers} />

        <CommandCenterTable
          {...{
            handleAllDancer,
            allChecked,
            dancerStatus,
            selectedDancers,
            handleToggleDancer,
          }}
        />
      </Stack>
    </Paper>
  );
}
