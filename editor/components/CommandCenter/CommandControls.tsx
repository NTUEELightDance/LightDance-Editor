import React, { useState } from "react";
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

import { waveSurferAppInstance } from "../Wavesurfer/WaveSurferApp";
import { setCurrentTime } from "@/core/actions";
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
  const [delay, setDelay] = useState(0);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "3rem",
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
        <TextField
          sx={{ width: "5rem", p: 0 }}
          label="delay (s)"
          type="number"
          variant="outlined"
          value={0}
          size="small"
          onChange={(e) => {
            const delay = Number(e.target.value);
            if (delay < 0) {
              e.target.value = "0";
            }
            setDelay(delay);
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
                  delay,
                },
              });
              waveSurferAppInstance.play();
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
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Button
            onClick={() =>
              send({
                topic: "red",
                payload: {
                  dancers: selectedRPis,
                },
              })
            }
            variant="outlined"
            size="small"
            color="error"
          >
            red
          </Button>
          <Button
            onClick={() =>
              send({
                topic: "green",
                payload: {
                  dancers: selectedRPis,
                },
              })
            }
            variant="outlined"
            size="small"
            color="success"
          >
            green
          </Button>
          <Button
            onClick={() =>
              send({
                topic: "blue",
                payload: {
                  dancers: selectedRPis,
                },
              })
            }
            variant="outlined"
            size="small"
            color="primary"
          >
            blue
          </Button>
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

export default CommandControls;
