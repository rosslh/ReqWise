import { get as getValue } from "svelte/store";
import { jwt } from "./stores";

const host = process.env.SAPPER_APP_API_URL;

const commonOptions = () => ({
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getValue(jwt)}`,
  },
});

const throwError = (httpMethod) => {
  throw new Error(`Failed ${httpMethod} request`);
};

const fetcher = (endpoint, options) => {
  if (endpoint.charAt(0) !== "/") {
    endpoint = `/${endpoint}`;
  }
  return fetch(`${host}${endpoint}`, {
    ...commonOptions(),
    ...options,
  })
    .then((r) => {
      if (r.ok) {
        return r.json();
      } else {
        throwError(options.method || "GET");
      }
    })
    .catch(() => {
      throwError(options.method || "GET");
    });
};

export const get = (endpoint) => fetcher(endpoint, {});

export const post = (endpoint, body) =>
  fetcher(endpoint, { method: "POST", body: JSON.stringify(body) });

export const put = (endpoint, body) =>
  fetcher(endpoint, { method: "PUT", body: JSON.stringify(body) });

export const patch = (endpoint, body) =>
  fetcher(endpoint, { method: "PATCH", body: JSON.stringify(body) });

export const del = (endpoint) => fetcher(endpoint, { method: "DELETE" });
