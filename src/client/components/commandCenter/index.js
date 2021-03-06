import React, { useEffect, useState } from "react";

// mui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

// contants
import { COMMANDS } from "../../constants";

// command api
import commandApi from "./agent";

// client socket

const useStyles = makeStyles((theme) => ({
  commands: {
    display: "inline-block",
    padding: theme.spacing(1),
  },
}));

/**
 * CommandCenter
 */
export default function CommandCenter() {
  // styles
  const classes = useStyles();

  const [statusBar, setStatusBar] = useState({});

  /* const renderStatusBar = (dancers) => {
    setStatusBar(
      Object.keys(dancers).map((dancer) => {
        return <p>{dancers[dancer].msg}</p>;
      })
    );
  }; */

  useEffect(() => {
    console.log(commandApi); // for test
  }, []);

  // useEffect(() => {
  //   renderStatusBar(socket.statusBar);
  // }, [socket.statusBar]);

  return (
    <div>
      {COMMANDS.map((command) => {
        return (
          <div className={classes.commands}>
            <Button
              variant="outlined"
              onClick={(e) => {
                e.preventDefault();
                const dataToServer = {
                  selectedDancers: ["dancer0test"], // fill the state
                  startTime: 0, // fill the number with variable
                  whenToPlay: 0, // fill the number with variable
                  ledData: [], // fill the array with variable
                  controlJson: {}, // fill
                  lightCurrentStatus: {},
                };
                commandApi[command](dataToServer);
              }}
            >
              {command}
            </Button>
          </div>
        );
      })}
      
    </div>
  );
}
