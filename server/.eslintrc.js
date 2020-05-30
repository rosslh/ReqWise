module.exports = {
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2019,
        "sourceType": "module"
    },
    "env": {
        "node": true,
        "es6": true
    },
    "ignorePatterns": [
        "node_modules/"
    ],
    "rules": {
        "no-unused-vars": [
            "error",
            {
                "argsIgnorePattern": "^_",
                "args": "none"
            }
        ]
    },
};