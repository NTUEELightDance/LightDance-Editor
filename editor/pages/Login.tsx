import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useReactiveVar } from "@apollo/client";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";

import { reactiveState } from "@/core/state";
import { authenticate } from "@/core/actions";

export default function LogIn() {
  const isLoggedIn = useReactiveVar(reactiveState.isLoggedIn);
  const location = useLocation();

  if (isLoggedIn) {
    const { from } = location.state as { from: { pathname: string } };
    return <Navigate to={from?.pathname || "/"} />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const account = formData.get("account") as string;
    const password = formData.get("password") as string;
    // const remember = formData.get("remember") === "on";
    authenticate({ payload: { account, password } });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: "8rem",
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Log in
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "30rem",
        }}
        noValidate
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id="account"
          label="Account"
          name="account"
          autoComplete="account"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Log In
        </Button>
        <FormControlLabel
          control={<Checkbox name="remember" color="primary" />}
          label="Remember me"
        />
      </Box>
    </Box>
  );
}
