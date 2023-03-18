import React, { useRef, useState } from "react";
import { PartialControlPanelMessage } from "@/hooks/useCommandCenter";
import { reactiveState } from "@/core/state";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import SkipPreviousRoundedIcon from "@mui/icons-material/SkipPreviousRounded";
import LoadIcon from "@mui/icons-material/Input";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DarkAllIcon from "@mui/icons-material/FlashOff";
import RebootIcon from "@mui/icons-material/PowerSettingsNew";
import DeleteIcon from "@mui/icons-material/Delete";

import { red, blue, green, yellow, cyan } from "@mui/material/colors";

import { waveSurferAppInstance } from "../Wavesurfer/WaveSurferApp";
import { setCurrentTime } from "@/core/actions";
import { ButtonBase } from "@mui/material";
import CountDown from "./CountDown";

interface CommandControlsProps {
  selectedRPis: string[];
  send: (message: PartialControlPanelMessage) => void;
  websocketConnected: boolean;
  reconnect: () => void;
}

function CommandControls({
  selectedRPis,
  send,
  reconnect,
}: CommandControlsProps) {
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [counterRunning, setCounterRunning] = useState(false);

  const delayPlayTimeout = useRef<NodeJS.Timeout | null>(null);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "4rem",
      }}
    >
      <Button onClick={reconnect} size="small" variant="contained">
        refresh
      </Button>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <CountDown duration={delaySeconds} running={counterRunning} />
        <TextField
          sx={{ width: "5rem", p: 0 }}
          label="delay (s)"
          type="number"
          variant="outlined"
          value={delaySeconds}
          size="small"
          onChange={(e) => {
            const delay = Number(e.target.value);
            if (delay < 0) {
              e.target.value = "0";
            }
            setDelaySeconds(delay);
          }}
        />
        <ButtonGroup>
          <CommandButton
            variant="normal"
            onClick={() => {
              send({
                topic: "play",
                payload: {
                  dancers: selectedRPis,
                  start: reactiveState.currentTime(),
                  delay: delaySeconds * 1000,
                },
              });

              delayPlayTimeout.current = setTimeout(() => {
                waveSurferAppInstance.play();
              }, delaySeconds * 1000);

              setCounterRunning(true);
            }}
            label="play"
            icon={<PlayArrowRoundedIcon fontSize="small" />}
          />
          <CommandButton
            variant="normal"
            onClick={() => {
              send({
                topic: "pause",
                payload: {
                  dancers: selectedRPis,
                },
              });
              waveSurferAppInstance.pause();

              setCounterRunning(false);
            }}
            label="pause"
            icon={<PauseRoundedIcon fontSize="small" />}
          />
          <CommandButton
            variant="normal"
            onClick={() => {
              send({
                topic: "stop",
                payload: {
                  dancers: selectedRPis,
                },
              });
              waveSurferAppInstance.stop();

              setCounterRunning(false);
            }}
            label="stop"
            icon={<StopRoundedIcon fontSize="small" />}
          />
          <CommandButton
            variant="normal"
            onClick={() => setCurrentTime({ payload: 0 })}
            label="go to start"
            icon={<SkipPreviousRoundedIcon fontSize="small" />}
          />
        </ButtonGroup>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0.5,
          }}
        >
          <ColorButton color="red" send={send} selectedRPis={selectedRPis} />
          <ColorButton color="green" send={send} selectedRPis={selectedRPis} />
          <ColorButton color="blue" send={send} selectedRPis={selectedRPis} />
          <ColorButton color="yellow" send={send} selectedRPis={selectedRPis} />
          <ColorButton color="cyan" send={send} selectedRPis={selectedRPis} />
          <ColorButton
            color="magenta"
            send={send}
            selectedRPis={selectedRPis}
          />
        </Box>
        <ButtonGroup>
          <CommandButton
            variant="normal"
            onClick={() =>
              send({
                topic: "upload",
                payload: {
                  dancers: selectedRPis,
                },
              })
            }
            label="upload"
            icon={<UploadFileIcon fontSize="small" />}
          />
          <CommandButton
            variant="normal"
            onClick={() =>
              send({
                topic: "load",
                payload: {
                  dancers: selectedRPis,
                },
              })
            }
            label="load"
            icon={<LoadIcon fontSize="small" />}
          />
        </ButtonGroup>

        <ButtonGroup>
          <CommandButton
            variant="normal"
            onClick={() =>
              send({
                topic: "darkAll",
              })
            }
            label="dark all"
            icon={<DarkAllIcon fontSize="small" />}
          />
          <CommandButton
            variant="normal"
            onClick={() =>
              send({
                topic: "close",
                payload: {
                  dancers: selectedRPis,
                },
              })
            }
            label="close"
            icon={<DeleteIcon fontSize="small" />}
          />
          <CommandButton
            variant="normal"
            onClick={() =>
              send({
                topic: "reboot",
                payload: {
                  dancers: selectedRPis,
                },
              })
            }
            label="reboot"
            icon={<RebootIcon fontSize="small" />}
          />
        </ButtonGroup>
      </Box>
    </Box>
  );
}

interface NormalCommandButtonProps {
  variant: "normal";
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
}

interface IconCommandButtonProps {
  variant: "icon";
  onClick: () => void;
  label?: string;
  icon: React.ReactNode;
}

type CommandButtonProps = NormalCommandButtonProps | IconCommandButtonProps;

function CommandButton({ variant, label, onClick, icon }: CommandButtonProps) {
  if (variant === "icon") {
    return (
      <IconButton size="small" onClick={onClick}>
        {icon}
      </IconButton>
    );
  }
  return (
    <Tooltip title={label}>
      <Button size="small" onClick={onClick}>
        {icon}
      </Button>
    </Tooltip>
  );
}

interface ColorButtonProps {
  color: "red" | "green" | "blue" | "yellow" | "magenta" | "cyan";
  send: (message: PartialControlPanelMessage) => void;
  selectedRPis: string[];
}

const colorTable = {
  red: red[600],
  green: green[600],
  blue: blue[600],
  yellow: yellow[600],
  magenta: "#ff00ff",
  cyan: cyan[600],
};

function ColorButton({ color, send, selectedRPis }: ColorButtonProps) {
  return (
    <Tooltip title={`send ${color}`}>
      <ButtonBase
        onClick={() =>
          send({
            topic: color,
            payload: {
              dancers: selectedRPis,
            },
          })
        }
        sx={{
          w: "1rem",
          h: "1rem",
          borderRadius: "25%",
          bgcolor: colorTable[color],
          p: "0.75rem",
        }}
      ></ButtonBase>
    </Tooltip>
  );
}

export default CommandControls;
