import React, { useState, useEffect } from "react";

import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import { login } from "../../slices/globalSlice";

import store from "../../store";

export default function Login() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleLogin = () => {
    console.log("login");
    store.dispatch(login(username, password));
    setOpen(false);
  };

  return (
    <div>
      <Button
        onClick={handleOpen}
        Button
        size="small"
        variant="text"
        color="default"
      >
        LOGIN
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="max-width-dialog-title">Login</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="username"
            type="email"
            fullWidth
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="password"
            type="password"
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogin} color="primary">
            LOGIN
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
