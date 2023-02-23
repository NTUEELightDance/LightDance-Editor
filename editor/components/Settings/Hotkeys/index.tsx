import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TableVirtuoso, TableComponents } from "react-virtuoso";

interface HotKey {
  label: string;
  key: string;
}

interface ColumnData {
  label: string;
  width: string;
  dataKey: keyof HotKey;
}

const HotKeyList: HotKey[] = [
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
  {
    label: "unselect all dancers",
    key: "ctrl/cmd+shift+a",
  },
  {
    label: "select the next dancer",
    key: "down arrow",
  },
  {
    label: "select the previous dancer",
    key: "up arrow",
  },
  {
    label: "play/pause",
    key: "space",
  },
  {
    label: "next frame",
    key: "right arrow / w",
  },
  {
    label: "previous frame",
    key: "left arrow / q",
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
    label: "switch between position editor and control editor",
    key: "v",
  },
  {
    label: "",
    key: "g",
  },
];

const columns: ColumnData[] = [
  {
    width: "30%",
    label: "HOTKEYS",
    dataKey: "key",
  },
  {
    width: "70%",
    label: "FUNCTIONS",
    dataKey: "label",
  },
];

const VirtuosoTableComponents: TableComponents<HotKey> = {
  // eslint-disable-next-line react/display-name
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
    />
  ),
  TableHead,
  TableRow: ({ ...props }) => <TableRow {...props} />,
  // eslint-disable-next-line react/display-name
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          style={{ width: column.width }}
          sx={{
            backgroundColor: "background.paper",
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

function rowContent(_index: number, row: HotKey) {
  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell key={column.dataKey}>{row[column.dataKey]}</TableCell>
      ))}
    </React.Fragment>
  );
}

export default function HotKeys() {
  return (
    <Paper style={{ height: 380, width: "100%" }}>
      <TableVirtuoso
        data={HotKeyList}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  );
}
