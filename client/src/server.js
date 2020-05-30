import sirv from "sirv";
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import session from "express-session";
import { Firestore } from "@google-cloud/firestore";
const MemoryStore = require('memorystore')(session)
import * as sapper from "@sapper/server";

import "./assets/normalize.css";
import "./assets/milligram.css";
import "./assets/global.css";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const { FirestoreStore } = require("@google-cloud/connect-firestore");

const expressServer = express()
  .set('trust proxy', 1)
  .use(bodyParser.json())
  .use(
    session({
      name: "__session", // this name is required by GCP cloud functions
      secret: "replace-this-secret-1aqwsedrftgyhu",
      resave: false,
      saveUninitialized: false, // TODO: investigate why disabling this setting breaks logout button
      cookie: {
        maxAge: 31536000,
      },
      store: dev
        ? new MemoryStore({
          checkPeriod: 86400000 // prune expired entries every 24h
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
