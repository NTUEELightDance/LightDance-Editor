import { LoadingButton as MuiLoadingButton } from "@mui/lab";
import Button from "@mui/material/Button";

export interface ButtonProps {
  onClick?: () => void;
}

function LoadingButton() {
  return (
    <MuiLoadingButton
      loading
      variant="outlined"
      size="small"
      sx={{
        "&.MuiLoadingButton-loading": {
          border: "0.5px solid rgba(255, 255, 255, 0.4)",
        },
        "&.MuiLoadingButton-loading>.MuiLoadingButton-loadingIndicator": {
          color: "rgba(255, 255, 255, 0.4)",
        },
      }}
    >
      load
    </MuiLoadingButton>
  );
}

function SaveButton({ onClick }: ButtonProps) {
  return (
    <Button
      variant="outlined"
      size="small"
      color="primary"
      {...(onClick && { onClick })}
    >
      SAVE
    </Button>
  );
}

function CancelButton({ onClick }: ButtonProps) {
  return (
    <Button
      variant="outlined"
      size="small"
      color="error"
      {...(onClick && { onClick })}
    >
      CANCEL
    </Button>
  );
}

function EditButton({ onClick }: ButtonProps) {
  return (
    <Button
      variant="outlined"
      size="small"
      color="primary"
      {...(onClick && { onClick })}
    >
      EDIT
    </Button>
  );
}

function DeleteButton({ onClick }: ButtonProps) {
  return (
    <Button
      variant="outlined"
      size="small"
      color="error"
      {...(onClick && { onClick })}
    >
      DEL
    </Button>
  );
}

function AddButton({ onClick }: ButtonProps) {
  return (
    <Button
      variant="outlined"
      size="small"
      color="primary"
      {...(onClick && { onClick })}
    >
      ADD
    </Button>
  );
}

export {
  LoadingButton,
  SaveButton,
  CancelButton,
  EditButton,
  DeleteButton,
  AddButton,
};
