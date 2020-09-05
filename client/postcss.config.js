const mode = process.env.NODE_ENV;
const dev = mode === "development";

module.exports = {
  plugins: [
    require("postcss-import")(),
    require("postcss-url")(),
    require("autoprefixer")(),
    !dev &&
    require("@fullhuman/postcss-purgecss")({
      content: ["./src/**/*.svelte", "./src/**/*.html"],
      whitelist: ["nprogress", 'bar', 'peg', 'nprogress-custom-parent'], // progress bar is dynamically inserted
      defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
    }),
    !dev && require("cssnano")({ preset: "default" }),
  ].filter(Boolean)
};