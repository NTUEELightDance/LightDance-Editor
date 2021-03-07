import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

// mui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
// contants
import { COMMANDS } from "../../constants";

// command api
import commandApi from "./agent";

// redux selector and actions
import { selectGlobal } from "../../slices/globalSlice";

const useStyles = makeStyles((theme) => ({
  commands: {
    display: "inline-block",
    padding: theme.spacing(0.5),
  },
  btns: {
    textTransform: "none",
  },
  root: {
    display: "inline-block",
    padding: theme.spacing(0.5),
    width: "100px",
  },
}));

/**
 * CommandCenter
 */
export default function CommandCenter() {
  // styles
  const classes = useStyles();

  // redux
  const { dancerStatus, controlRecord, currentStatus } = useSelector(
    selectGlobal
  );

  // local state
  const [statusBar, setStatusBar] = useState([]);
  const [selectedDancer, setSelectedDancer] = useState({});
  const [startTime, setStartTime] = useState(0);
  const [delay, setDelay] = useState(0);

  const renderStatusBar = (dancers) => {
    setStatusBar(
      Object.keys(dancers).map((dancerName) => {
        return {
          dancerName,
          ...dancers[dancerName],
        };
      })
    );
  };

  const initStatusBar = () => {
    setSelectedDancer(
      Object.keys(dancerStatus).reduce((acc, dancerName) => {
        return {
          ...acc,
          [dancerName]: false,
        };
      }, {})
    );
  };

  useEffect(() => {
    initStatusBar();
  }, []);

  useEffect(() => {
    console.log("dancerStatus\n", dancerStatus);
    if (dancerStatus !== {}) {
      renderStatusBar(dancerStatus);
    }
  }, [dancerStatus]);

  // test
  useEffect(() => {
    console.log(selectedDancer);
  }, [selectedDancer]);

  return (
    <div>
      <TextField
        size="small"
        type="number"
        className={classes.root}
        label="start time"
        onChange={(e) => {
          setStartTime(e.target.value);
        }}
      />
      <TextField
        size="small"
        type="number"
        className={classes.root}
        label="delay(ms)"
        onChange={(e) => {
          setDelay(e.target.value);
        }}
      />

      {COMMANDS.map((command) => {
        return (
          <div className={classes.commands}>
            <Button
              className={classes.btns}
              variant="outlined"
              onClick={(e) => {
                e.preventDefault();
                const dataToServer = {
                  selectedDancers: Object.keys(selectedDancer).filter(
                    (dancer) => {
                      return selectedDancer[dancer];
                    }
                  ), // fill the state
                  startTime: startTime !== "" ? parseInt(startTime, 10) : 0, // fill the number with variable
                  delay: delay !== "" ? parseInt(delay, 10) : 0, // fill the number with variable
                  ledData: [], // fill the array with variable
                  controlJson: controlRecord, // fill
                  lightCurrentStatus: currentStatus,
                };
                commandApi[command](dataToServer);
              }}
            >
              {command}
            </Button>
          </div>
        );
      })}
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  onChange={(e) => {
                    Object.keys(selectedDancer).forEach((dancer) => {
                      setSelectedDancer((state) => ({
                        ...state,
                        [dancer]: e.target.checked,
                      }));
                    });
                  }}
                />
              </TableCell>
              <TableCell>DancerName</TableCell>
              <TableCell>HostName</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statusBar.map((row) => {
              const { dancerName, hostname, ip, OK, msg, isConnected } = row;
              const isItemSelected = selectedDancer[dancerName];

              return (
                <TableRow
                  key={dancerName}
                  hover
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedDancer((state) => ({
                      ...state,
                      [dancerName]: !state[dancerName],
                    }));
                  }}
                  role="checkbox"
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={isItemSelected} />
                  </TableCell>
                  <TableCell>{dancerName}</TableCell>
                  <TableCell>{hostname}</TableCell>
                  <TableCell>{ip}</TableCell>
                  <TableCell>
                    {isConnected ? (
                      <p style={{ color: "green" }}>Connected</p>
                    ) : (
                      <p style={{ color: "red" }}>Disconnected</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p style={{ color: OK ? "green" : "red" }}>{msg}</p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
