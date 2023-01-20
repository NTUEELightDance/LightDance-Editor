import type { State } from "../models";

import { registerActions } from "../registerActions";

export type AuthenticatePayload = {
  account: string;
  password: string;
};

const actions = registerActions({
  authenticate: async (
    state: State,
    { account, password }: AuthenticatePayload
  ) => {
    console.log({
      account,
      password,
    });
    state.isLoggedIn = true;
  },
});

export const { authenticate } = actions;
