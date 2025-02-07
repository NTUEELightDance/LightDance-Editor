import React from "react";
import { Text, Box } from "ink";
import chalk from "chalk";
import { useDancer } from "../hooks/useDancer.js";

export default function StatusPanel() {
  const { dancers } = useDancer();
  console.log(dancers);
  return (
    <Box>
      <Text>{chalk.cyan("Status Panel")}</Text>
    </Box> // TODO
  );
}
