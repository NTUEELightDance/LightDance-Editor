import { useLocation, Navigate } from "react-router-dom";
import { useReactiveVar } from "@apollo/client";

import { reactiveState } from "@/core/state";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const isLoggedIn = useReactiveVar(reactiveState.isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
