import type { State } from "../models";

import { registerActions } from "../registerActions";

import { loginAgent } from "@/api";

export type AuthenticatePayload = {
  username: string;
  password: string;
};

const actions = registerActions({
  authenticate: async (
    state: State,
    { username, password }: AuthenticatePayload
  ) => {
    const { success, token } = await loginAgent.login(username, password);
    state.token = token;
    state.isLoggedIn = success;
  },
  checkToken: async (state: State) => {
    const { success, token } = await loginAgent.checkToken();
    state.token = token;
    state.isLoggedIn = success;
  },
});

export const { authenticate, checkToken } = actions;
