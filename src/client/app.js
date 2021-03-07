import { hot } from "react-hot-loader/root";
import React, { useEffect } from "react";
// mui
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
// redux
import { useSelector, useDispatch } from "react-redux";
// actions
import { selectLoad, fetchLoad } from "./slices/loadSlice";
// layout
import Layout from "./layout";
import "./app.css";
// components
import Bar from "./components/bar";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#94BBFF",
      dark: "#94BBFF",
    },
    background: {
      paper: "#292929",
      default: "#121212",
    },
  },
});

/**
 * Component for the main
 * @component
 */
const App = () => {
  const { init } = useSelector(selectLoad);
  const dispatch = useDispatch();
  useEffect(async () => {
    if (!init) {
      await dispatch(fetchLoad());
    }
  }, [init]);
  return (
    <div>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {init ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100vh",
            }}
          >
            <Bar />
            <div style={{ flexGrow: 1, position: "relative" }}>
              <Layout />
            </div>
          </div>
        ) : (
          "Loading..."
        )}
      </ThemeProvider>
    </div>
  );
};

export default hot(App);
