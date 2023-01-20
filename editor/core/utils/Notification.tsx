import { useLayoutEffect, useState } from "react";
import { Alert, Button, Fade } from "@mui/material";

import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";

import { useHotkeys } from "react-hotkeys-hook";

type MessageType = "info" | "success" | "error" | "warning";

function Notification({
  type = "info",
  content,
}: {
  type: MessageType;
  content: string;
}) {
  return (
    <Alert severity={type} variant="filled">
      {content}
    </Alert>
  );
}

function Confirmation({
  type = "info",
  content,
}: {
  type: MessageType;
  content: string;
}) {
  // for the fade component to programatically close the modal
  const [open, setOpen] = useState(true);

  const handleConfirm = () => {
    // virtualy click Swal's confirm button to trigger its confirm event to get the return value
    ConfirmationSwal.clickConfirm();
    setOpen(false);
  };
  const handleCancel = () => {
    ConfirmationSwal.clickCancel();
    setOpen(false);
  };

  // the keyboard event is sometimes kidnapped by other components for an unknown reason
  // thus we use useHotKeys to guarantee we can trigger the event
  useHotkeys("enter", (e) => {
    e.preventDefault();
    handleConfirm();
  });
  useHotkeys("esc", (e) => {
    e.preventDefault();
    handleCancel();
  });
  // force focus on the confirm button
  useLayoutEffect(() => {
    const confirmButton = document.getElementById("confirm-confirm-button");
    confirmButton != null && confirmButton.focus();
  }, []);

  return (
    <Fade in={open}>
      <Alert
        severity={type}
        variant="filled"
        action={
          <>
            <Button color="inherit" size="small" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={handleConfirm}
              id="confirm-confirm-button"
            >
              Confirm
            </Button>
          </>
        }
      >
        {content}
      </Alert>
    </Fade>
  );
}

// get swal notification manager with react integration
const NotificationSwal = withReactContent(Swal);
const notify = (type: MessageType) => (content: string) => {
  // mount the node passed to html to the dom with some animation
  NotificationSwal.fire({
    html: <Notification type={type} content={content} />,
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 4000,
    background: "transparent",
  });
};

// get swal notification manager with react integration
const ConfirmationSwal = withReactContent(Swal);
const confirm = (type: MessageType) => async (content: string) => {
  // mount the node passed to html to the dom with some animation
  const { isConfirmed } = await ConfirmationSwal.fire({
    html: <Confirmation type={type} content={content} />,
    position: "top",
    showConfirmButton: false,
    background: "transparent",
  });

  return isConfirmed;
};

export const notification = {
  info: notify("info"),
  success: notify("success"),
  error: notify("error"),
  warning: notify("warning"),
};

// please note that confirmation is an async function,
// as opposse to normal window.confirm, which is not
export const confirmation = {
  info: confirm("info"),
  success: confirm("success"),
  error: confirm("error"),
  warning: confirm("warning"),
};
