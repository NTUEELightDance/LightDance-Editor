import type { State } from "../models";

import { registerActions } from "../registerActions";

import { authAgent } from "@/api";

export type LoginPayload = {
  username: string;
  password: string;
};

const actions = registerActions({
  login: async (state: State, { username, password }: LoginPayload) => {
    const { success, token } = await authAgent.login(username, password);
    state.token = token;
    state.isLoggedIn = success;
  },
  logout: async (state: State) => {
    const { success } = await authAgent.logout();
    if (success) {
      state.token = "";
      state.isLoggedIn = false;
      window.location.reload();
    }
  },
  checkToken: async (state: State) => {
    const { success, token } = await authAgent.checkToken();

    state.token = token;
    state.isLoggedIn = success;
  },
});

export const { login, logout, checkToken } = actions;
