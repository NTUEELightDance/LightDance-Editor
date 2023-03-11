import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";

import { DancerStatusType } from "types/hooks/webSocket";

function CommandCenterTable({
  handleAllDancer,
  allChecked,
  dancerStatus,
  selectedDancers,
  handleToggleDancer,
}: {
  handleAllDancer: () => void;
  allChecked: () => boolean;
  dancerStatus: DancerStatusType;
  selectedDancers: string[];
  handleToggleDancer: (dancerName: string) => void;
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox onChange={handleAllDancer} checked={allChecked()} />
            </TableCell>
            <TableCell>DancerName</TableCell>
            <TableCell>HostName</TableCell>
            <TableCell>IP</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Message</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(dancerStatus).map(
            ([dancerName, { hostname, ip, Ok, msg, isConnected }]) => {
              const isItemSelected = selectedDancers.includes(dancerName);
              return (
                <TableRow
                  key={dancerName}
                  hover
                  onClick={() => {
                    handleToggleDancer(dancerName);
                  }}
                  role="checkbox"
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={isItemSelected} />
                    {/* <Checkbox checked={isItemSelected} disable = !isConnected/> */}
                  </TableCell>
                  <TableCell>{dancerName}</TableCell>
                  <TableCell>{hostname}</TableCell>
                  <TableCell>{ip}</TableCell>
                  <TableCell>
                    {isConnected ? (
                      <span style={{ color: "green" }}>Connected</span>
                    ) : (
                      <span style={{ color: "red" }}>Disconnected</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p style={{ color: Ok ? "green" : "red" }}>{msg}</p>
                  </TableCell>
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CommandCenterTable;
