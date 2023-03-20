import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

import PageWrapper from "@/containers/PageWrapper";

import Loading from "@/components/Loading";
import RequireAuth from "@/components/RequireAuth";
import Login from "./Login";
import NotFound from "./NotFound";

import { ROUTES } from "@/constants";
import { log } from "@/core/utils";

const theme = createTheme({ palette: { mode: "dark" } });

const EditorWrapper = lazy(async () => await import("./App"));
const Command = lazy(async () => await import("./Command"));
const Editor = lazy(async () => await import("./Editor"));

export default function RootRouter() {
  log("last updated: 2023-03-20 19:25");

  return (
    <ThemeProvider theme={theme}>
      <PageWrapper>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route
              index
              element={
                <Navigate
                  to={ROUTES.EDITOR}
                  replace={true}
                  state={{ from: ROUTES.ROOT }}
                />
              }
            />
            <Route
              path={ROUTES.EDITOR}
              element={
                <RequireAuth>
                  <Suspense fallback={<Loading />}>
                    <EditorWrapper />
                  </Suspense>
                </RequireAuth>
              }
            >
              <Route
                index
                element={
                  <RequireAuth>
                    <Suspense fallback={<Loading />}>
                      <Editor />
                    </Suspense>
                  </RequireAuth>
                }
              />
              <Route
                path={ROUTES.COMMAND_CENTER}
                element={
                  <RequireAuth>
                    <Suspense fallback={<Loading />}>
                      <Command />
                    </Suspense>
                  </RequireAuth>
                }
              />
            </Route>
            <Route
              path={ROUTES.LOGIN}
              element={
                <Suspense fallback={<Loading />}>
                  <Login />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PageWrapper>
    </ThemeProvider>
  );
}
