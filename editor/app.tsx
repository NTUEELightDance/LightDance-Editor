import { hot } from "react-hot-loader/root";
import { useEffect } from "react";
// mui
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
// redux
import { useSelector, useDispatch } from "react-redux";
// actions
import { selectLoad, fetchLoad } from "./slices/loadSlice";
// components
import Header from "components/Header";
import Loading from "components/Loading";
// hooks
import useControl from "hooks/useControl";
import usePos from "hooks/usePos";

import "./app.css";
import Layout from "containers/Layout";

const theme = createTheme({
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
  typography: {
    // In Chinese and Japanese the characters are usually larger,
    // so a smaller fontsize may be appropriate.
    fontSize: 12,
  },
});

/**
 * Component for the main
 * @component
 */
const App = () => {
  const { init } = useSelector(selectLoad);
  const dispatch = useDispatch();

  const { loading: controlLoading, error: controlError } = useControl();
  const { loading: posLoading, error: posError } = usePos();

  useEffect(() => {
    if (!init) {
      dispatch(fetchLoad());
    }
  }, [init]);

  return (
    <div>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {init && !controlLoading && !posLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100vh",
            }}
          >
            <Header />
            <div style={{ flexGrow: 1, position: "relative" }}>
              <Layout />
            </div>
          </div>
        ) : (
          <Loading />
        )}
      </ThemeProvider>
    </div>
  );
};

export default hot(App);
