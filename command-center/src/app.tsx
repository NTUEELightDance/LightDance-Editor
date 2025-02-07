import React from "react";
import { Text, Box, useStdout, useApp, useInput } from "ink";

import useDimensions from "./hooks/useDimensions.js";
import ControlPanel from "./containers/control.js";
import LogPanel from "./containers/log.js";
import StatusPanel from "./containers/status.js";
import { DancerProvider } from "./hooks/useDancer.js";

export default function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const dimensions = useDimensions();
  useInput((input, key) => {
    if (input === "q") {
      exit();
    }
  });

  return (
    <DancerProvider>
      <Box
        flexDirection="row"
        justifyContent="space-around"
        alignItems="center"
        // Leave one row when debugging
        height={dimensions[1] && dimensions[1] - 1}
        width={dimensions[0] && dimensions[0]}
      >
        <Box flexDirection="row" height="100%">
          {/* Right Section (Status + Log) */}
          <Box width="100%" height="100%" flexDirection="column">
            {/* Status */}
            <Box height="30%" borderStyle="round" borderColor="green">
              <ControlPanel />
            </Box>
            <Box height="70%" borderStyle="round" borderColor="blue">
              <StatusPanel />
            </Box>
          </Box>
        </Box>
      </Box>
    </DancerProvider>
  );
}
