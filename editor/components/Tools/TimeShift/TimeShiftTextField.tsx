import React, { useState } from "react";

import { TextField } from "@mui/material";

import useTimeFormat from "hooks/useTimeFormat";

const TimeShiftTextField = ({
  label,
  time,
  setTime,
}: {
  label: string;
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { textFieldProps } = useTimeFormat([time, setTime]);

  return (
    <TextField
      {...textFieldProps}
      sx={{ width: "10em" }}
      label={label}
      size="small"
    />
  );
};

export default TimeShiftTextField;
