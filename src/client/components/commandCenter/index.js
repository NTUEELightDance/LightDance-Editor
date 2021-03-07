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
import { selectGlobal, initDancerStatus } from "../../slices/globalSlice";

const useStyles = makeStyles((theme) => ({
  commands: {
    display: "inline-block",
    padding: theme.spacing(1),
  },
  btns: {
    textTransform: "none",
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
  const dispatch = useDispatch();

  // local state
  const [statusBar, setStatusBar] = useState([]);
  const [selectedDancer, setSelectedDancer] = useState({});
  const [startTime, setStartTime] = useState(0);
  const [whenToPlay, setWhenToPlay] = useState(0);

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

  const initStatusBar = async () => {
    const fetchJson = (path) => {
      return fetch(path).then((data) => data.json());
    };
    const boardConfig = await fetchJson("/data/board_config.json");

    dispatch(initDancerStatus(boardConfig));
    setSelectedDancer(
      Object.keys(boardConfig).reduce((acc, hostname) => {
        const { dancerName } = boardConfig[hostname];
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
        type="number"
        className={classes.commands}
        label="start time"
        onChange={(e) => {
          setStartTime(e.target.value);
        }}
      />
      <TextField
        type="number"
        className={classes.commands}
        label="when to play"
        onChange={(e) => {
          setWhenToPlay(e.target.value);
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
                  startTime: startTime !== "" ? startTime : 0, // fill the number with variable
                  whenToPlay: whenToPlay !== "" ? whenToPlay : 0, // fill the number with variable
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
        <Table className={classes.table}>
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
              const { dancerName, hostname, ip, OK, msg } = row;
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
                    {OK ? (
                      <p style={{ color: "green" }}>Success</p>
                    ) : (
                      <p style={{ color: "red" }}>Failed</p>
                    )}
                  </TableCell>
                  <TableCell>{msg}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
