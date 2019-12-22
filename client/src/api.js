const host = "http://localhost:3000";
const commonOptions = {
  mode: "cors",
  headers: {
    "Content-Type": "application/json"
  }
};

export const get = endpoint =>
  fetch(`${host}${endpoint}`, {
    ...commonOptions
  }).then(r => r.json());

export const post = (endpoint, body) =>
  fetch(`${host}${endpoint}`, {
    ...commonOptions,
    method: "POST",
    body: JSON.stringify(body)
  }).then(r => r.json());

export const put = () => {};
export const del = () => {};
