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
        setTime((time) => time - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [running]);

  return <Typography>{time}</Typography>;
}
