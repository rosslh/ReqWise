const host = "http://localhost:3000";
const commonOptions = {
  mode: "cors",
  headers: {
    "Content-Type": "application/json"
  }
};

const throwError = httpMethod => {
  throw new Error(`Failed ${httpMethod} request`);
};

export const get = endpoint =>
  fetch(`${host}${endpoint}`, {
    ...commonOptions
  })
    .then(r => {
      if (r.ok) {
        return r.json();
      } else {
        throwError("GET");
      }
    })
    .catch(() => {
      throwError("GET");
    });

export const post = (endpoint, body) =>
  fetch(`${host}${endpoint}`, {
    ...commonOptions,
    method: "POST",
    body: JSON.stringify(body)
  })
    .then(r => {
      if (r.ok) {
        return r.json();
      } else {
        throwError("POST");
      }
    })
    .catch(() => {
      throwError("POST");
    });

export const put = () => {};
export const del = () => {};
