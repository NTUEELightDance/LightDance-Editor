import React, { useState, useEffect } from "react";

import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import { useSelector } from "react-redux";

import { loginPost } from "../../api";

import { selectGlobal } from "../../slices/globalSlice";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const { username } = useSelector(selectGlobal);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleLogin = () => {
    console.log("login");
    loginPost(user, password);
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={handleOpen} size="small" variant="text" color="default">
        {username || "LOGIN"}
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
            onChange={(e) => setUser(e.target.value)}
            value={user}
          />
          <TextField
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
