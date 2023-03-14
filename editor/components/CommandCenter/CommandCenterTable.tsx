import _ from "lodash";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";

import type { RPiStatus } from "@/hooks/useCommandCenter";
import type { Updater } from "use-immer";

function CommandCenterTable({
  websocketConnected,
  RPiStatus,
  setSelectedDancers,
  selectedDancers,
}: {
  websocketConnected: boolean;
  RPiStatus: RPiStatus;
  setSelectedDancers: Updater<string[]>;
  selectedDancers: string[];
}) {
  const handleToggleDancer = (dancerName: string) => {
    setSelectedDancers((draft) => {
      const index = draft.indexOf(dancerName);
      if (index !== -1) draft.splice(index, 1);
      // index == -1 -> not in the array
      else draft.push(dancerName);
    });
  };

  const handleAllDancer = () => {
    const allChecked = selectedDancers.length === Object.keys(RPiStatus).length;
    if (allChecked) {
      // clear all
      setSelectedDancers([]);
    } else {
      // select all
      setSelectedDancers(Object.keys(RPiStatus));
    }
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                onChange={handleAllDancer}
                checked={
                  selectedDancers.length === Object.keys(RPiStatus).length
                }
              />
            </TableCell>
            <TableCell>name</TableCell>
            <TableCell>message</TableCell>
            <TableCell>IP</TableCell>
            <TableCell>MAC</TableCell>
            <TableCell>status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_.sortBy(Object.values(RPiStatus), ({ name }) =>
            parseInt(name.split("_")[0])
          ).map(({ name, message, IP, MAC, connected, statusCode }) => (
            <TableRow key={name}>
              <TableCell padding="checkbox">
                <Checkbox
                  onChange={() => handleToggleDancer(name)}
                  checked={selectedDancers.includes(name)}
                />
              </TableCell>
              <TableCell
                sx={{
                  color:
                    !websocketConnected || !connected
                      ? "gray"
                      : connected
                      ? "green"
                      : "inherit",
                }}
              >
                {name}
              </TableCell>
              <TableCell
                sx={{
                  color:
                    !websocketConnected || !connected
                      ? "gray"
                      : statusCode === 0
                      ? "inherit"
                      : "red",
                }}
              >
                {message}
              </TableCell>
              <TableCell
                sx={{
                  color: !websocketConnected || !connected ? "gray" : "inherit",
                }}
              >
                {IP}
              </TableCell>
              <TableCell
                sx={{
                  color: !websocketConnected || !connected ? "gray" : "inherit",
                }}
              >
                {MAC}
              </TableCell>
              <TableCell
                sx={{
                  color:
                    !websocketConnected || !connected
                      ? "gray"
                      : connected
                      ? "green"
                      : "inherit",
                }}
              >
                {connected ? "connected" : "disconnected"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CommandCenterTable;
