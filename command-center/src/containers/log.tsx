import React from "react";
import { Text, Box } from "ink";
import chalk from "chalk";

export default function LogPanel() {
  return (
    <Box>
      <Text>{chalk.yellow("Log Panel")}</Text>
    </Box> // TODO
  );
}
