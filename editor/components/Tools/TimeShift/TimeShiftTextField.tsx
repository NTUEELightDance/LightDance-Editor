import React, { useState } from "react";

import { TextField } from "@mui/material";

import useTimeInput from "hooks/useTimeInput";

const TimeShiftTextField = ({
  label,
  time,
  setTime,
}: {
  label: string;
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { textFieldProps } = useTimeInput([time, setTime]);

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
