import { TextField } from "@mui/material";

import useTimeInput from "hooks/useTimeInput";

function TimeShiftTextField({
  label,
  time,
  setTime,
  autoFocus,
}: {
  label: string;
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  autoFocus?: boolean;
}) {
  const { textFieldProps } = useTimeInput([time, setTime]);

  return (
    <TextField
      {...textFieldProps}
      sx={{ width: "10em" }}
      label={label}
      size="small"
      autoFocus={autoFocus}
    />
  );
}

export default TimeShiftTextField;
