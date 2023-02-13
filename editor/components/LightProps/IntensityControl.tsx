import { Grid, Slider, Input } from "@mui/material";
import { Flare } from "@mui/icons-material";

function IntensityControl({
  intensity,
  setIntensity,
}: {
  intensity: number;
  setIntensity: (intensity: number) => void;
}) {
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setIntensity(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const intensity = Number(event.target.value);
    if (intensity < 0) setIntensity(0);
    else if (intensity === 11 || intensity >= 15) setIntensity(15);
    else if (intensity >= 12 && intensity <= 14) setIntensity(10);
    else setIntensity(intensity);
  };

  const valueLabelFormat = (value: number) => {
    return value === 15 ? "flash" : value;
  };

  const sliderMarks: Array<{
    value: number;
    label: string | JSX.Element | null;
  }> = [];
  for (let i = 0; i <= 10; i++) {
    sliderMarks.push({
      value: i,
      label: i === 0 || i === 10 ? String(i) : null,
    });
  }
  sliderMarks.push({ value: 15, label: <Flare sx={{ fontSize: "1.25em" }} /> });

  return (
    <>
      <Grid item>
        <Slider
          value={intensity}
          onChange={handleSliderChange}
          min={0}
          max={15}
          step={null}
          valueLabelDisplay="auto"
          valueLabelFormat={valueLabelFormat}
          marks={sliderMarks}
          sx={{
            width: "10em",
            position: "relative",
            top: "0.5em",
          }}
          componentsProps={{
            thumb: {
              // @ts-expect-error thumb can take sx
              sx: {
                width: "1.25em",
                height: "1.25em",
              },
            },
          }}
        />
      </Grid>
      <Grid item>
        <Input
          value={intensity}
          size="small"
          onChange={handleInputChange}
          inputProps={{
            step: 1,
            min: 0,
            max: 15,
            type: "number",
          }}
          sx={{ width: "3em" }}
        />
      </Grid>
    </>
  );
}

export default IntensityControl;
