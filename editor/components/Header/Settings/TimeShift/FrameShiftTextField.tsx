import { TextField } from "@mui/material";

import useFrameInput from "hooks/useFrameInput";

function FrameShiftTextField({
  label,
  frame,
  setFrame,
  autoFocus,
}: {
  label: string;
  frame: number;
  setFrame: React.Dispatch<React.SetStateAction<number>>;
  autoFocus?: boolean;
}) {
  const { textFieldProps } = useFrameInput([frame, setFrame]);

  return (
    <TextField
      type="number"
      {...textFieldProps}
      sx={{ width: "10em" }}
      label={label}
      size="small"
      autoFocus={autoFocus}
    />
  );
}

export default FrameShiftTextField;
