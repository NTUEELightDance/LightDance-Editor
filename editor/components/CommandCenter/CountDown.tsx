import Typography from "@mui/material/Typography";

import { useEffect, useState } from "react";

export interface CountDownProps {
  duration: number; // seconds
  running: boolean;
}

export default function CountDown({ duration, running }: CountDownProps) {
  const [time, setTime] = useState(duration);

  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        setTime((time) => (time > 0 ? time - 1 : time));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTime(duration);
    }
  }, [running, duration]);

  return <Typography>{toTimeDisplay(time)}</Typography>;
}

function toTimeDisplay(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [minutes, seconds].map((t) => t.toString().padStart(2, "0")).join(":");
}
