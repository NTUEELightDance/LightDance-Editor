import { Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";

interface LEDPartButtonProps {
  chosenLEDPart: string;
  handleChangeChosenLEDPart: (
    event: React.MouseEvent<HTMLElement>,
    newChosenLEDPart: string
  ) => void;
  displayLEDParts: string[];
}

export default function LEDPartButton({
  chosenLEDPart,
  handleChangeChosenLEDPart,
  displayLEDParts,
}: LEDPartButtonProps) {
  return (
    <>
      <Typography>PARTS</Typography>
      <ToggleButtonGroup
        color="primary"
        size="medium"
        exclusive
        onChange={handleChangeChosenLEDPart}
        value={chosenLEDPart}
      >
        {displayLEDParts.map((v) => (
          <ToggleButton value={v} key={v}>
            {v}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
}
