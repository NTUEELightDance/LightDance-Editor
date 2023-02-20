import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
} from "@mui/material";

const HotKeyList = [
  {
    label: "copy the selected dancer's lightProps",
    key: "ctrl/cmd+c",
  },
  {
    label: "paste the lightProps to the selected dancers",
    key: "ctrl/cmd+v",
  },
  {
    label: "undo the last action",
    key: "ctrl/cmd+z",
  },
  {
    label: "redo the last action",
    key: "ctrl/cmd+shift+z",
  },
  {
    label: "cut the selected dancer's lightProps",
    key: "ctrl/cmd+x",
  },
  {
    label: "select all dancers",
    key: "ctrl/cmd+a",
  },
];
export default function HotKeys() {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>HOTKEYS</TableCell>
              <TableCell align="right">FUNCTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {HotKeyList.map(({ label, key }) => (
              <TableRow
                key={key}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {key}
                </TableCell>
                <TableCell align="right">{label}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
