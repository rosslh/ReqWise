import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import json from '@rollup/plugin-json';
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import config from "sapper/config/rollup.js";
import pkg from "./package.json";

import getPreprocessor from "svelte-preprocess";

const sapperEnv = require('sapper-environment');

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) =>
  (warning.code === 'MISSING_EXPORT' && /'preload'/.test(warning.message)) ||
  (warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message)) ||
  onwarn(warning);

const preprocess = getPreprocessor({
  postcss: true
});

const envVars = sapperEnv('REQWISE');

const apiUrl = process.env.API_URL ? `"${process.env.API_URL}"` : '"http://localhost:3001"';

export default {
  client: {
    input: config.client.input(),
    output: config.client.output(),
    plugins: [
      replace({
        ...envVars,
        "process.env.API_URL": apiUrl,
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      svelte({
        dev,
        hydratable: true,
        emitCss: true,
        preprocess,
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      commonjs(),

      json(),

      legacy &&
      babel({
        extensions: [".js", ".mjs", ".html", ".svelte"],
        babelHelpers: 'runtime',
        exclude: ["node_modules/@babel/**"],
        presets: [
          [
            "@babel/preset-env",
            {
              targets: "> 0.25%, not dead",
            },
          ],
        ],
        plugins: [
          "@babel/plugin-syntax-dynamic-import",
          [
            "@babel/plugin-transform-runtime",
            {
              useESModules: true,
            },
          ],
        ],
      }),

      !dev &&
      terser({
        module: true,
      }),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },

  server: {
    input: config.server.input(),
    output: config.server.output(),
    plugins: [
      replace({
        ...envVars,
        "process.env.API_URL": apiUrl,
        "process.browser": false,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),

      svelte({
        hydratable: true,
        generate: "ssr",
        dev,
        preprocess,
      }),
      resolve({
        dedupe: ["svelte"],
      }),
      commonjs(),
      json()
    ],
    external: Object.keys(pkg.dependencies).concat(
      require("module").builtinModules ||
      Object.keys(process.binding("natives"))
    ),
    preserveEntrySignatures: 'strict',
    onwarn,
  },

  // serviceworker: {
  //   input: config.serviceworker.input(),
  //   output: config.serviceworker.output(),
  //   plugins: [
  //     resolve(),
  //     replace({
  //       ...envVars,
  //       "process.browser": true,
  //       "process.env.NODE_ENV": JSON.stringify(mode),
  //     }),
  //     commonjs(),
  //     !dev && terser(),
  //   ],
  //   preserveEntrySignatures: false,
  //   onwarn,
  // },
};
