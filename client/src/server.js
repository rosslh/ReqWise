import sirv from "sirv";
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import session from "express-session";
import { Firestore } from "@google-cloud/firestore";
import sessionFileStore from "session-file-store";
import * as sapper from "@sapper/server";

import "./assets/normalize.css";
import "./assets/milligram.css";
import "./assets/global.css";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const FileStore = sessionFileStore(session);
const { FirestoreStore } = require("@google-cloud/connect-firestore");

const expressServer = express()
  .use(bodyParser.json())
  .use(
    session({
      name: "__session",
      secret: "replace-this-secret-1aqwsedrftgyhu",
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 31536000,
      },
      store: dev
        ? new FileStore({
            path: ".sessions", // process.env.NOW ? `/tmp/sessions` : `.sessions`,
          })
        : new FirestoreStore({
            dataset: new Firestore({
              kind: "express-sessions",
            }),
          }),
    })
  )
  .use(
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware({
      session: (req) => {
        // console.log("server.js", req.session && req.session.user);
        return {
          user: req.session && req.session.user,
        };
      },
    })
  );

if (dev) {
  expressServer.listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
}

export { expressServer };
