import { isAxiosError } from "axios";

import axios from "./axios";
import { notification } from "core/utils";

export const authAgent = {
  login: async (username: string, password: string) => {
    try {
      const res = await axios.post("/login", { username, password });
      notification.success("Login success");
      return {
        token: res.data.token,
        success: true,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        notification.error(error.response?.data?.err);
      }

      return {
        success: false,
      };
    }
  },
  logout: async () => {
    try {
      await axios.post("/logout");

      return {
        success: true,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        notification.error(error.response?.data?.err);
      }

      return {
        success: false,
      };
    }
  },
  // check token in cookie
  checkToken: async () => {
    try {
      const res = await axios.get("/checkToken");

      return {
        token: res.data.token,
        success: res.status === 200,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  },
};
