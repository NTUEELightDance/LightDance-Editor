import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";

import PageWrapper from "@/containers/PageWrapper";

import Loading from "@/components/Loading";
import NotFound from "./NotFound";

const Command = lazy(async () => await import("./Command"));
const Editor = lazy(async () => await import("./Editor"));

export default function RootRouter () {
  return (
    <PageWrapper>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<Loading />}>
                <Editor />
              </Suspense>
            }
          />
          <Route
            path="/command"
            element={
              <Suspense fallback={<Loading />}>
                <Command />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </PageWrapper>
  );
}
