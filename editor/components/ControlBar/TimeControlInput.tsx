import TextField from "@material-ui/core/TextField";

const TimeControlInput = ({
  value,
  handleChange,
  placeholder,
}: {
  value: number;
  handleChange: (value: number) => void;
  placeholder: string;
}) => {
  return (
    <TextField
      style={{ width: "8em" }}
      size="small"
      variant="outlined"
      type="number"
      placeholder={placeholder}
      value={value}
      inputProps={{
        min: 0,
      }}
      onChange={(e) => handleChange(parseInt(e.target.value, 10))}
    />
  );
};

export default TimeControlInput;
