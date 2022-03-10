import { useState, useContext } from "react";
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
import { useImmer } from "use-immer";

// hooks
import useWebsocket from "../../hooks/useWebsocket";
// constants
import { COMMANDS } from "constants";
// contexts
import { WaveSurferAppContext } from "../../contexts/WavesurferContext";

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
  mediumCell: {
    width: "160px",
    textAlign: "center",
  },
  table: {
    backgroundColor: "black",
  },
}));

/**
 * CommandCenter
 */
export default function CommandCenter() {
  // styles
  const classes = useStyles();
  // hook
  const { dancerStatus, sendCommand, setDancerStatus } = useWebsocket();
  // delay
  const [delay, setDelay] = useState(0);
  const [selectedDancers, setSelectedDancers] = useImmer([]); // array of dancerName that is selected

  const handleToggleDancer = (dancerName) => {
    setSelectedDancers((draft) => {
      const index = draft.indexOf(dancerName);
      if (index !== -1) draft.splice(index, 1);
      //index == -1 -> not in the array
      else draft.push(dancerName);
    });
  };
  const handleAllDancer = () => {
    if (selectedDancers.length) {
      // clear all
      setSelectedDancers([]);
    } else {
      // select all
      setSelectedDancers(Object.keys(dancerStatus));
    }
  };

  // wavesurfer for play pause
  const { waveSurferApp } = useContext(WaveSurferAppContext);
  const handlePlay = () => waveSurferApp.play();
  const handlePause = () => waveSurferApp.pause();
  const handleStop = () => waveSurferApp.stop();

  // click btn, will call api to server
  const handleClickBtn = (command) => {
    const payload = {
      command,
      selectedDancers,
      delay,
    };
    // setDancerStatus((draft) => {
    //   draft["1_chi"].OK = true;
    // });
    sendCommand(payload);

    // play or pause or stop
    if (command === COMMANDS.PLAY) {
      console.log(`Start to play at delay ${delay}`);
      setTimeout(() => handlePlay(), delay);
    } else if (command === COMMANDS.PAUSE) {
      handlePause();
    } else if (command === COMMANDS.STOP) {
      handleStop();
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <TextField
        size="small"
        type="number"
        className={classes.root}
        label="delay(ms)"
        onChange={(e) => {
          setDelay(e.target.value);
        }}
      />

      {Object.values(COMMANDS).map((command) => {
        return (
          <div className={classes.commands} key={command}>
            <Button
              className={classes.btns}
              variant="outlined"
              onClick={(e) => handleClickBtn(command)}
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
                <Checkbox onChange={handleAllDancer} />
              </TableCell>
              <TableCell className={classes.mediumCell}>DancerName</TableCell>
              <TableCell className={classes.mediumCell}>HostName</TableCell>
              <TableCell className={classes.mediumCell}>IP</TableCell>
              <TableCell className={classes.mediumCell}>Status</TableCell>
              <TableCell>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(dancerStatus).map(
              ([dancerName, { hostname, ip, OK, msg, isConnected }]) => {
                const isItemSelected = selectedDancers.includes(dancerName);
                return (
                  <TableRow
                    key={dancerName}
                    hover
                    onClick={() => handleToggleDancer(dancerName)}
                    role="checkbox"
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                    <TableCell className={classes.mediumCell}>
                      {dancerName}
                    </TableCell>
                    <TableCell className={classes.mediumCell}>
                      {hostname}
                    </TableCell>
                    <TableCell className={classes.mediumCell}>{ip}</TableCell>
                    <TableCell className={classes.mediumCell}>
                      {isConnected ? (
                        <span style={{ color: "green" }}>Connected</span>
                      ) : (
                        <span style={{ color: "red" }}>Disconnected</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p style={{ color: OK ? "green" : "red" }}>{msg}</p>
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
