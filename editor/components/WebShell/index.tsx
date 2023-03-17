import { useReactiveVar } from "@apollo/client";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import TreeView from "@mui/lab/TreeView";
import TreeItem, {
  TreeItemContentProps,
  useTreeItem,
  TreeItemProps,
} from "@mui/lab/TreeItem";
import { blue } from "@mui/material/colors";

import clsx from "clsx";
import _ from "lodash";

import { reactiveState } from "@/core/state";
import { forwardRef, useState } from "react";
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import useCommandCenter from "@/hooks/useCommandCenter";

export default function WebShell() {
  const dancers = useReactiveVar(reactiveState.dancers);
  const [selectedDancers, setSelectedDancers] = useState<string[]>([]); // array of dancerName that is selected
  const { RPiStatus, connected, send } = useCommandCenter();
  const [command, setCommand] = useState<string>("");

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setSelectedDancers(nodeIds);
  };

  const handleSelectAll = () => {
    if (selectedDancers.length === Object.keys(dancers).length) {
      setSelectedDancers([]);
    } else {
      setSelectedDancers(Object.keys(dancers));
    }
  };

  const handleExecute = () => {
    send({
      topic: "webShell",
      payload: {
        dancers: selectedDancers,
        command: command.split(" "),
      },
    });
  };

  return (
    <Paper
      sx={{ minHeight: "100%", p: "1rem", display: "flex", gap: "0.5rem" }}
    >
      <Paper sx={{ width: "12rem", p: "0.25rem" }} elevation={3}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontSize: "1.2rem",
              p: "0.25rem",
            }}
          >
            Dancers
          </Typography>
          <Button size="small" onClick={handleSelectAll}>
            all
          </Button>
        </Box>
        <Divider sx={{ my: "0.25rem" }} />
        <TreeView
          selected={selectedDancers}
          onNodeSelect={handleSelect}
          multiSelect
        >
          {Object.keys(dancers).map((dancer) => (
            <DancerListItem key={dancer} nodeId={dancer} label={dancer} />
          ))}
        </TreeView>
      </Paper>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "end",
          gap: "0.5rem",
        }}
      >
        <TextField
          sx={{ width: "100%" }}
          label="Command"
          variant="outlined"
          multiline
          rows={4}
          onChange={(e) => setCommand(e.target.value)}
        />
        <Button
          color="error"
          variant="contained"
          size="small"
          onClick={handleExecute}
          disabled={connected}
        >
          execute
        </Button>
        {selectedDancers.length === 1 ? null : (
          <Table sx={{ width: "100%" }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>name</TableCell>
                <TableCell>message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_.sortBy(
                Object.values(RPiStatus).map(({ ethernet, wifi }) => {
                  if (ethernet.connected === wifi.connected) {
                    return { ...ethernet, interface: "ethernet" };
                  }
                  if (ethernet.connected) {
                    return { ...ethernet, interface: "ethernet" };
                  }
                  return { ...wifi, interface: "wifi" };
                }),
                ({ name }) => parseInt(name.split("_")[0])
              )
                .filter(
                  ({ name }) =>
                    selectedDancers.length === 0 ||
                    selectedDancers.includes(name)
                )
                .map(({ name, message, connected, statusCode }) => (
                  <TableRow key={name}>
                    <TableCell
                      sx={{
                        color: !connected
                          ? "gray"
                          : statusCode === 0
                          ? "inherit"
                          : "red",
                        width: "12rem",
                      }}
                    >
                      {name}
                    </TableCell>
                    <TableCell>
                      <Typography>{message}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Paper>
  );
}

const DancerListItemContent = forwardRef(function CustomContent(
  props: TreeItemContentProps,
  ref
) {
  const { classes, className, label, nodeId } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    preventSelection(event);
  };
  const handleSelectionClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    handleSelection(event);
  };
  return (
    <Box
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref as React.Ref<HTMLDivElement>}
      sx={{
        ":hover": {
          p: {
            color: blue[100],
          },
        },
      }}
    >
      <Typography
        onClick={handleSelectionClick}
        className={classes.label}
        sx={{ p: "2px" }}
      >
        {label}
      </Typography>
    </Box>
  );
});

function DancerListItem(props: TreeItemProps) {
  return <TreeItem ContentComponent={DancerListItemContent} {...props} />;
}
