import axios, { AxiosInstance } from "axios";

const { BACKEND_HOSTNAME, BACKEND_PORT } = process.env;
const instance: AxiosInstance = axios.create({
  baseURL: `https://lightdance-editor.ntuee.org/api/editor-server/`,
});

export { instance };
