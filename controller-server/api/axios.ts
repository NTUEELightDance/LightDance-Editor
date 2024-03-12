import axios, { AxiosInstance } from "axios";

const { BACKEND_HOSTNAME, BACKEND_PORT } = process.env;
const instance: AxiosInstance = axios.create({
  baseURL: `http://${BACKEND_HOSTNAME}:${BACKEND_PORT}/api`
});

export { instance };
