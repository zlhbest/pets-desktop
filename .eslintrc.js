module.exports = {
  root: true,
  env: {
    node: true,
  },
  overrides: [
    {
      files: ["src/software/**/*.vue", "src/software/**/*.js"],

      extends: ["plugin:vue/vue3-essential", "eslint:recommended"],
      parserOptions: {
        parser: "@babel/eslint-parser",
      },
    },
    // live2d使用的是ts 的校验
    {
      files: ["src/live2d/**/*.ts"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
    },
    // mmd使用的是ts 的校验
    {
      files: ["src/mmd/**/*.ts"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
    },
  ],
};
