import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/v1",
  timeout: 50000,
});

function getStoredToken() {
  const savedAuth =
    localStorage.getItem("taskflow_auth") ||
    sessionStorage.getItem("taskflow_auth");

  if (savedAuth) {
    try {
      return JSON.parse(savedAuth)?.token || "";
    } catch {
      return "";
    }
  }

  return localStorage.getItem("token") || "";
}

http.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

function getErrorMessage(error, fallbackMessage) {
  const message = error?.response?.data?.message;

  if (typeof message === "string") return message;
  if (message && typeof message === "object") {
    return Object.values(message).join(", ");
  }

  return fallbackMessage || error.message || "Request failed";
}

async function sendRequest(request, fallbackMessage) {
  try {
    const response = await request;
    const data = response.data;

    if (data?.status === false || data?.success === false) {
      throw new Error(data.message || fallbackMessage || "Request failed");
    }

    return data;
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getErrorMessage(error, fallbackMessage));
  }
}

const requests = {
  get: (url, fallbackMessage, config = {}) =>
    sendRequest(http.get(url, config), fallbackMessage),
  post: (url, body, fallbackMessage, config = {}) =>
    sendRequest(http.post(url, body, config), fallbackMessage),
  put: (url, body, fallbackMessage, config = {}) =>
    sendRequest(http.put(url, body, config), fallbackMessage),
  patch: (url, body, fallbackMessage, config = {}) =>
    sendRequest(http.patch(url, body, config), fallbackMessage),
  delete: (url, body, fallbackMessage, config = {}) =>
    sendRequest(http.delete(url, { ...config, data: body }), fallbackMessage),
};

export default requests;
