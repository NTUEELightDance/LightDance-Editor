import React from "react";
import { Text, Box } from "ink";
import chalk from "chalk";

export default function StatusPanel() {
  return (
    <Box>
      <Text>{chalk.cyan("Status Panel")}</Text>
    </Box> // TODO
  );
}
