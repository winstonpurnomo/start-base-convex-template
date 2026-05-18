import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import remix from "ultracite/oxlint/remix";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, remix, vitest],
  rules: {
    "func-style": "off",
    "func-names": "off",
    "max-classes-per-file": "off",
    "no-promise-executor-return": "off",
    "no-use-before-define": "off",
    "promise/avoid-new": "off",
    "promise/param-names": "off",
    "require-yield": "off",
    "sort-keys": "off",
  },
  ignorePatterns: [
    "**/*.gen.{js,jsx,ts,tsx}",
    "worker-configuration.d.ts",
    "**/_generated/**/*.{js,jsx,ts,tsx}",
  ],
  overrides: [
    {
      files: ["**/convex/**/*"],
      jsPlugins: ["@convex-dev/eslint-plugin"],
      rules: {
        "require-await": "off",
        "typescript/no-explicit-any": "off",
        "typescript/no-unsafe-argument": "off",
        "typescript/no-unsafe-assignment": "off",
        "typescript/no-unsafe-call": "off",
        "typescript/no-unsafe-member-access": "off",
        "typescript/no-unsafe-return": "off",
        "unicorn/filename-case": [
          "error",
          {
            case: "camelCase",
          },
        ],
      },
    },
  ],
});
