module.exports = {
  "extends": "airbnb",
  "env": {
    "es6": true,
    "browser": true
    },
    "parserOptions": {
      "ecmaVersion": 6,
      "sourceType": "module",
      "ecmaFeatures": {
          "jsx": true,
          "experimentalObjectRestSpread": true,
      }
  },
  "rules": {
    "no-param-reassign": 0,
    "prefer-arrow-callback": 0,
    "no-use-before-define": 0,
  }
};