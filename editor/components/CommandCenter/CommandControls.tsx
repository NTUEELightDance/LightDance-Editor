import React, { useContext, useState } from "react";
// mui
import {
  Button,
  ButtonGroup,
  Box,
  TextField,
  Stack,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// hooks
import useWebsocket from "hooks/useWebsocket";
// constants
import { COMMANDS } from "constants";
// contexts
import { WaveSurferAppContext } from "contexts/WavesurferContext";

import { wavesurferContext } from "types/components/wavesurfer";

import { notification } from "core/utils";

export default function CommandControls({
  selectedDancers,
}: {
  selectedDancers: string[];
}) {
  // hook
  const { delay, sendCommand, setDelay } = useWebsocket();

  const [showDropDown, setShowDropDown] = useState(false);

  const [delayPlayTimeout, setDelayPlayTimeout] = useState<number | null>(null);

  // wavesurfer for play pause
  const { waveSurferApp } = useContext(
    WaveSurferAppContext
  ) as wavesurferContext;
  const handlePlay = () => waveSurferApp.play();
  const handlePause = () => waveSurferApp.pause();
  const handleStop = () => waveSurferApp.stop();

  // click btn, will call api to server
  const handleClickBtn = (command: string) => {
    const payload = {
      command,
      selectedDancers,
      delay,
    };
    try {
      sendCommand(payload);
      let notificationContent = `command successfully sent: ${command}`;

      // play or pause or stop
      if (command === COMMANDS.PLAY) {
        const timeout = setTimeout(() => handlePlay(), delay);
        setDelayPlayTimeout(timeout);
        notificationContent += `.\nLight dance will play after ${(
          delay / 1000
        ).toFixed(1)} seconds`;
      } else if (command === COMMANDS.PAUSE) {
        handlePause();
      } else if (command === COMMANDS.STOP) {
        delayPlayTimeout && clearTimeout(delayPlayTimeout);
        handleStop();
      }
      notification.success(notificationContent);
    } catch (error) {
      notification.error((error as Error).message);
    }
  };

  const ButtonGroup1 = [
    { command: COMMANDS.UPLOAD_LED, label: "upload LED" },
    { command: COMMANDS.UPLOAD_OF, label: "upload OF" },
    { command: COMMANDS.LOAD },
  ];

  const ButtonGroup2 = [
    { command: COMMANDS.PLAY },
    { command: COMMANDS.PAUSE },
    { command: COMMANDS.STOP },
  ];

  const ButtonGroup3 = [
    { command: COMMANDS.LIGTHCURRENTSTATUS, label: "show current frame" },
    { command: COMMANDS.TEST },
  ];

  const ButtonGroup4 = [
    { command: COMMANDS.KICK },
    { command: COMMANDS.SHUTDOWN },
    { command: COMMANDS.REBOOT },
  ];

  return (
    <Box>
      <Stack direction="column" gap="1em">
        <Stack direction="row" gap="1em" justifyContent="space-between">
          <Stack direction="row" gap="1em">
            <Button
              size="small"
              variant="contained"
              onClick={() => handleClickBtn(COMMANDS.SYNC)}
            >
              sync
            </Button>

            <TextField
              size="small"
              type="number"
              label="delay(ms)"
              onChange={(e) => {
                setDelay(parseInt(e.target.value));
              }}
              sx={{ width: "10em" }}
            />
            <ButtonGroup variant="outlined">
              {ButtonGroup2.map(({ command }) => (
                <DefaultCommandButton
                  command={command}
                  handleClick={() => handleClickBtn(command)}
                />
              ))}
            </ButtonGroup>
          </Stack>

          <IconButton
            onClick={() => setShowDropDown((showDropDown) => !showDropDown)}
          >
            <ExpandMoreIcon
              sx={{
                animation: `${showDropDown ? "spinDown" : "spinUp"} 0.5s ease`,
                "animation-fill-mode": "forwards",
                "@keyframes spinDown": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(180deg)" },
                },
                "@keyframes spinUp": {
                  "0%": { transform: "rotate(180deg)" },
                  "100%": { transform: "rotate(0deg)" },
                },
              }}
            />
          </IconButton>
        </Stack>
        <Collapse in={showDropDown}>
          <Stack direction="row" gap="1em">
            <ButtonGroup variant="outlined">
              {ButtonGroup1.map(({ command, label }) => (
                <DefaultCommandButton
                  command={command}
                  label={label}
                  handleClick={() => handleClickBtn(command)}
                />
              ))}
            </ButtonGroup>
            <ButtonGroup variant="outlined">
              {ButtonGroup3.map(({ command, label }) => (
                <DefaultCommandButton
                  command={command}
                  label={label}
                  handleClick={() => handleClickBtn(command)}
                />
              ))}
            </ButtonGroup>
            <ButtonGroup variant="outlined">
              {ButtonGroup4.map(({ command }) => (
                <DefaultCommandButton
                  command={command}
                  handleClick={() => handleClickBtn(command)}
                />
              ))}
            </ButtonGroup>
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
}

const DefaultCommandButton = ({
  command,
  handleClick,
  label,
}: {
  command: string;
  handleClick: () => void;
  label?: string;
}) => {
  return (
    <Button size="small" onClick={handleClick} key={command}>
      {label ? label : command}
    </Button>
  );
};

// SYNC,
// UPLOAD_LED, // need payload
// UPLOAD_OF, // need payload
// LOAD,

// PLAY, // need payload
// PAUSE,
// STOP,

// LIGTHCURRENTSTATUS, // need payload
// TEST, // need payload

// KICK,
// SHUTDOWN,
// REBOOT,
