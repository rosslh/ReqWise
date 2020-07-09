import io from "socket.io-client";
const host = process.env.API_URL;

const commonOptions = (token) => ({
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    Authorization: token && `Bearer ${token}`,
  },
});

const throwError = (httpMethod, endpoint) => {
  throw new Error(`Failed ${httpMethod} request to ${endpoint}`);
};

const fetcher = (endpoint, options, token) => {
  if (endpoint.charAt(0) !== "/") {
    endpoint = `/${endpoint}`;
  }
  const fetchFn =
    typeof window !== "undefined"
      ? window.fetch
      : require("node-fetch").default;

  return fetchFn(`${host}${endpoint}`, {
    ...commonOptions(token),
    ...options,
  })
    .then((r) => {
      if (r.ok) {
        return r.json();
      } else {
        throwError(options.method || "GET", endpoint);
      }
    })
    .catch((e) => {
      console.error(e);
      throwError(options.method || "GET", endpoint);
    });
};

export const get = (endpoint, token) => fetcher(endpoint, {}, token);

export const post = (endpoint, body, token) =>
  fetcher(endpoint, { method: "POST", body: JSON.stringify(body) }, token);

export const put = (endpoint, body, token) =>
  fetcher(endpoint, { method: "PUT", body: JSON.stringify(body) }, token);

export const patch = (endpoint, body, token) =>
  fetcher(endpoint, { method: "PATCH", body: JSON.stringify(body) }, token);

export const del = (endpoint, token) =>
  fetcher(endpoint, { method: "DELETE", body: "{}" }, token);

export const stream = (eventName, data, token, callback) => {
  if (typeof window === "undefined") {
    throw new Error("Only stream on client");
  }
  const socket = io(host);
  socket.on("message", callback);
  socket.on("reconnecting", () => { console.log("Stream ended. Restarting."); })
  socket.emit(eventName, { jwt: token, data })

  return function () { socket.close() };
}