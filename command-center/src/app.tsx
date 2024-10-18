import React from "react";
import { Text } from "ink";
import chalk from "chalk";

type Props = {
  name: string | undefined;
};

export default function App({ name = "Stranger" }: Props) {
  // TODO: Rewrite controller server into this app
  return <Text>{chalk.red("Hello, ") + chalk.redBright.inverse(name)}</Text>;
}
