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

// constants
import { COMMANDS } from "@/constants";
// contexts
import {
  WaveSurferAppContext,
  WavesurferContextType,
} from "contexts/WavesurferContext";

import { notification } from "core/utils";

import { panelPayloadType } from "types/hooks/webSocket";

export default function CommandControls({
  selectedDancers,
  delay,
  sendCommand,
  setDelay,
}: {
  selectedDancers: string[];
  delay: number;
  sendCommand: (panelPayload: panelPayloadType) => Promise<void>;
  setDelay: any;
}) {
  // hook

  const [showDropDown, setShowDropDown] = useState(false);

  const [delayPlayTimeout, setDelayPlayTimeout] =
    useState<NodeJS.Timeout | null>(null);

  // wavesurfer for play pause
  const { waveSurferApp } = useContext(
    WaveSurferAppContext
  ) as WavesurferContextType;
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
      } else if (command === COMMANDS.NTHU_PLAY) {
        const timeout = setTimeout(() => handlePlay(), delay);
        setDelayPlayTimeout(timeout);
        notificationContent += `.\nLight dance will play after ${(
          delay / 1000
        ).toFixed(1)} seconds`;
      } else if (command === COMMANDS.NTHU_STOP) {
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
    { command: COMMANDS.NTHU_PLAY },
    { command: COMMANDS.NTHU_STOP },
    { command: COMMANDS.PLAY },
    { command: COMMANDS.PAUSE },
    { command: COMMANDS.STOP },
    { command: COMMANDS.TEST },
  ];
  const ButtonGroup3 = [
    { command: COMMANDS.RESTARTCONTROLLER },
    { command: COMMANDS.STMINIT },
  ];

  const ButtonGroup4 = [
    { command: COMMANDS.KICK },
    { command: COMMANDS.SHUTDOWN },
    { command: COMMANDS.REBOOT },
  ];

  const ButtonGroup5 = [
    { command: COMMANDS.RED },
    { command: COMMANDS.BLUE },
    { command: COMMANDS.GREEN },
    { command: COMMANDS.DARKALL },
  ];

  // const ButtonGroup6 = [
  //   { command: COMMANDS.LIGTHCURRENTSTATUS, label: "show current frame" },
  //   { command: COMMANDS.TEST },
  // ];

  return (
    <Box>
      <Stack direction="column" gap="1em">
        <Stack direction="row" gap="1em" justifyContent="space-between">
          <Stack direction="row" gap="1em">
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                handleClickBtn(COMMANDS.SYNC);
              }}
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
                  key={command}
                  handleClick={() => {
                    handleClickBtn(command);
                  }}
                />
              ))}
            </ButtonGroup>
          </Stack>

          <IconButton
            onClick={() => {
              setShowDropDown((showDropDown) => !showDropDown);
            }}
          >
            <ExpandMoreIcon
              sx={{
                animation: `${showDropDown ? "spinDown" : "spinUp"} 0.5s ease`,
                animationFillMode: "forwards",
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
                  key={command}
                  command={command}
                  label={label}
                  handleClick={() => {
                    handleClickBtn(command);
                  }}
                />
              ))}
            </ButtonGroup>
            <ButtonGroup variant="outlined">
              {ButtonGroup3.map(({ command }) => (
                <DefaultCommandButton
                  key={command}
                  command={command}
                  handleClick={() => {
                    handleClickBtn(command);
                  }}
                />
              ))}
            </ButtonGroup>
          </Stack>
          <Stack direction="row" gap="1em" mt={2}>
            <ButtonGroup variant="outlined">
              {ButtonGroup4.map(({ command }) => (
                <DefaultCommandButton
                  key={command}
                  command={command}
                  handleClick={() => {
                    handleClickBtn(command);
                  }}
                />
              ))}
            </ButtonGroup>
            <ButtonGroup variant="outlined">
              {ButtonGroup5.map(({ command }) => (
                <DefaultCommandButton
                  key={command}
                  command={command}
                  handleClick={() => {
                    handleClickBtn(command);
                  }}
                />
              ))}
            </ButtonGroup>
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
}

function DefaultCommandButton({
  command,
  handleClick,
  label,
}: {
  command: string;
  handleClick: () => void;
  label?: string;
}) {
  return (
    <Button size="small" onClick={handleClick} key={command}>
      {label || command}
    </Button>
  );
}
