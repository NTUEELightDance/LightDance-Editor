import axios from "./axios";
import { notification } from "core/utils";

export const uploadExportDataApi = async (uploadFile) => {
  const formData = new FormData();
  formData.append("data", uploadFile);
  const response = await axios.post("/uploadData", formData);
  if (response.request.statusText === "OK")
    notification.success("Upload Success. Please refresh.");
  else notification.error("Upload Failed.");
};

export const downloadExportDataApi = async () => {
  const response = await axios.get("/exportData.json");
  if (response.request.statusText === "OK") return response.data;
  else notification.error("Download Failed.");
};

export const uploadLedDataApi = async (ledFile) => {
  const formData = new FormData();
  formData.append("data", ledFile);
  const response = await axios.post("/uploadLED", formData);
  if (response.request.statusText === "OK")
    notification.success("Upload Success. Please refresh.");
  else notification.error("Upload Failed.");
};

export const downloadLedDataApi = async () => {
  const response = await axios.get("/exportLED.json");
  if (response.request.statusText === "OK") return response.data;
  else notification.error("Download Failed.");
};
