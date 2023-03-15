import { useImmer } from "use-immer";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

import useCommandCenter from "@/hooks/useCommandCenter";
import CommandCenterTable from "./CommandCenterTable";
import CommandControls from "./CommandControls";

export default function CommandCenter() {
  const { send, connected, RPiStatus, reconnect } = useCommandCenter();
  const [selectedDancers, setSelectedDancers] = useImmer<string[]>([]); // array of dancerName that is selected

  return (
    <Paper sx={{ minHeight: "100%" }}>
      <Paper
        sx={{
          width: "100%",
          bgcolor: connected ? "green" : "red",
          fontSize: "0.6rem",
          textAlign: "center",
          p: 0,
        }}
        square
      >
        {connected ? "online" : "offline"}
      </Paper>
      <Stack gap="1rem" sx={{ p: "1rem" }}>
        <CommandControls
          selectedRPis={selectedDancers}
          send={send}
          websocketConnected={connected}
          reconnect={reconnect}
        />
        <CommandCenterTable
          websocketConnected={connected}
          RPiStatus={RPiStatus}
          selectedDancers={selectedDancers}
          setSelectedDancers={setSelectedDancers}
        />
      </Stack>
    </Paper>
  );
}
