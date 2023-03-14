import { useImmer } from "use-immer";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

import useWebsocket from "@/hooks/useCommandCenter";
import CommandCenterTable from "./CommandCenterTable";
import CommandControls from "./CommandControls";

export default function CommandCenter() {
  const { send, connected, RPiStatus, reconnect } = useWebsocket();
  const [selectedDancers, setSelectedDancers] = useImmer<string[]>([]); // array of dancerName that is selected

  return (
    <>
      <Paper
        sx={{
          width: "100%",
          bgcolor: "green",
          fontSize: "0.6rem",
          textAlign: "center",
          p: 0,
        }}
        square
      >
        {connected ? "online" : "offline"}
      </Paper>
      <Paper sx={{ p: "1rem", minHeight: "100%" }}>
        <Stack gap="2em">
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
    </>
  );
}
