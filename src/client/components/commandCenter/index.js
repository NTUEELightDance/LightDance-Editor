import React, { useEffect } from "react";

// mui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

// contants
import { COMMANDS } from "../../constants";

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

  // for fetch
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    // redirect: "follow",
  };

  const commandApi = COMMANDS.reduce((acc, command) => {
    let callback = null;
    const urlencoded = new URLSearchParams();

    switch (command) {
      case "play":
        callback = ({ startTime, whenToPlay }) => {
          urlencoded.append("startTime", startTime);
          urlencoded.append("whenToPlay", whenToPlay);
          fetch(`api/${command}`, {
            ...requestOptions,
            body: urlencoded,
          })
            // for test response
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
        };
        break;
      case "upload_control":
        callback = () => {
          fetch(`api/${command}`, requestOptions)
            // for test response
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
        };
        break;
      case "upload_led":
        // ledData is an array
        callback = ({ ledData }) => {
          fetch(`api/${command}`, {
            ...requestOptions,
            body: encodeURI(JSON.stringify({ ledData })),
          })
            // for test response
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
        };
        break;
      case "lightCurrentStatus":
        callback = () => {
          // TODO load status.json file
          fetch(`api/${command}`, requestOptions)
            // for test response
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
        };
        break;
      default:
        callback = () => {
          fetch(`api/${command}`, requestOptions)
            // for test response
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
        };
        break;
    }
    return {
      ...acc,
      [command]: callback,
    };
  }, {});

  useEffect(() => {
    console.log(commandApi); // for test
  }, []);

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
                  startTime: 0, // fill the number with variable
                  whenToPlay: 0, // fill the number with variable
                  ledData: [], // fill the array with variable
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
