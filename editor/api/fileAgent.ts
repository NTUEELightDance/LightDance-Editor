import axios from "./axios";
import { notification } from "core/utils";

export const downloadExportDataApi = async () => {
  const response = await axios.get("/exportData.json");
  if (response.request.statusText === "OK") return response.data;
  else notification.error("Download Failed.");
};
