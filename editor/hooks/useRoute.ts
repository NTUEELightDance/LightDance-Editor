import { useCallback, useMemo } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { ROUTES } from "@/constants";

export type PageName = keyof typeof ROUTES | "UNKNOWN";

export default function useRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  const page: PageName = useMemo(() => {
    const path = location.pathname;
    if (path === ROUTES.EDITOR) {
      return "EDITOR";
    } else if (path === ROUTES.COMMAND_CENTER) {
      return "COMMAND_CENTER";
    } else if (path === ROUTES.LOGIN) {
      return "LOGIN";
    } else if (path === ROUTES.ROOT) {
      return "ROOT";
    } else {
      return "UNKNOWN";
    }
  }, [location.pathname]);

  const toEditor = useCallback(() => {
    navigate(ROUTES.EDITOR);
  }, [navigate]);

  const toCommandCenter = useCallback(() => {
    navigate(ROUTES.COMMAND_CENTER);
  }, [navigate]);

  const toLogin = useCallback(() => {
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  return {
    location,
    page,
    navigate: { toEditor, toCommandCenter, toLogin },
  };
}
