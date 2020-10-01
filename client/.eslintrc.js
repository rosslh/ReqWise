module.exports = {
  "extends": "eslint:recommended",
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 2019,
    "sourceType": "module"
  },
  "env": {
    "es6": true,
    "browser": true,
    "node": true
  },
  "plugins": [
    "svelte3"
  ],
  "overrides": [
    {
      "files": [
        "**/*.svelte"
      ],
      "processor": "svelte3/svelte3"
    }
  ],
  "ignorePatterns": [
    "__sapper__/",
    "node_modules/",
    "cypress/"
  ],
  "rules": {
    "no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "semi": ["error", "always"]
  },
  "settings": {
    "svelte3/ignore-styles": () => true
  }
};
