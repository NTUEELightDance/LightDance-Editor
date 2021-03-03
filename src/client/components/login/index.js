import react, { useState, useEffect } from "react";

import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function Login() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  return (
    <div>
      <header className="App-header">
        <div className="Login">
          <TextField
            variant="standard"
            placeholder="Username"
            margin="normal"
            required
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <TextField
            variant="standard"
            placeholder="Password"
            margin="normal"
            required
            type="password"
            onChange={this.setPassword}
            value={this.state.password}
          />

          <div className="Button">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.signIn();
              }}
            >
              Log In
            </Button>
          </div>
        </div>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Sign In</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.state.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Okay
            </Button>
          </DialogActions>
        </Dialog>
      </header>
    </div>
  );
}
