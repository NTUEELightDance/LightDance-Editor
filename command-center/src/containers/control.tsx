import React from "react";
import { Text, Box } from "ink";
import chalk from "chalk";

export default function ControlPanel() {
  return (
    <Box>
      <Text>{chalk.green("Control Panel")}</Text>
    </Box> // TODO
  );
}
