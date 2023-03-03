import React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

interface ColumnData {
  label: string;
  width: string;
  dataKey: keyof HotKey;
}
interface HotKey {
  label: string;
  key: string;
}

const columns: readonly ColumnData[] = [
  { label: "HOTKEYS", width: "30%", dataKey: "key" },
  { label: "FUNCTIONS", width: "70%", dataKey: "label" },
];

const HotKeyList: HotKey[] = [
  {
    label: "copy the selected dancer's lightProps or position",
    key: "ctrl/cmd+c",
  },
  {
    label: "paste the lightProps or position to the selected dancers",
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
  {
    label: "unselect all dancers",
    key: "ctrl/cmd+shift+a",
  },
  {
    label: "next frame",
    key: "down arrow",
  },
  {
    label: "previous frame",
    key: "up arrow",
  },
  {
    label: "play/pause",
    key: "space",
  },
  {
    label: "shift 100 ms forward",
    key: "right arrow",
  },
  {
    label: "shift 100 ms backward",
    key: "left arrow",
  },
  {
    label: "shift 500 ms forward",
    key: "shift+right arrow",
  },
  {
    label: "shift 500 ms backward",
    key: "shift+left arrow",
  },
  {
    label: "start editing",
    key: "e",
  },
  {
    label: "add a frame",
    key: "a",
  },
  {
    label: "delete a frame",
    key: "del",
  },
  {
    label: "",
    key: "esc",
  },
  {
    label: "",
    key: "g",
  },
];

export default function Hotkeys() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ minHeight: 380, maxHeight: 460, width: "100%" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.label} style={{ width: column.width }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {HotKeyList.slice(
              page * rowsPerPage,
              page * rowsPerPage + rowsPerPage
            ).map((hotKey) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={hotKey.key}>
                  {columns.map((column) => {
                    return (
                      <TableCell key={column.dataKey}>
                        {hotKey[column.dataKey]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={HotKeyList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
