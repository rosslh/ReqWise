const host = process.env.SAPPER_APP_API_URL;

const commonOptions = (token) => ({
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    Authorization: token && `Bearer ${token}`,
  },
});

const throwError = (httpMethod) => {
  throw new Error(`Failed ${httpMethod} request`);
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
        throwError(options.method || "GET");
      }
    })
    .catch(() => {
      throwError(options.method || "GET");
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

export const stream = (endpoint, token, callback) => {
  // TODO: use JWT to fetch one-time token to use in query parameter
  if (typeof window === "undefined") {
    // EventSource only exists on client
    throw new Error("Only stream on client");
  }
  if (endpoint.charAt(0) !== "/") {
    endpoint = `/${endpoint}`;
  }

  const url = `${
    host
    }${endpoint}?jwt=${encodeURIComponent(token)}`;

  let streamSource = new EventSource(url);

  const closeStream = () => {
    streamSource.close();
    streamSource = null;
  };

  streamSource.onmessage = callback;

  streamSource.onerror = err => {
    console.log("EventSource ended. Restarting.");
  };

  return closeStream;
}