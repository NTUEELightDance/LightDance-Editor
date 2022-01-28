import TextField from "@material-ui/core/TextField";

const TimeControlInput = ({
  value,
  handleChange,
  placeholder,
}: {
  value: number;
  handleChange: (value: string | number) => void;
  placeholder: string;
}) => {
  return (
    <TextField
      style={{ width: "9em" }}
      size="small"
      variant="outlined"
      type="number"
      placeholder={placeholder}
      value={value}
      inputProps={{
        min: 0,
      }}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
};

export default TimeControlInput;
