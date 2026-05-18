import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    "**/*.gen.{js,jsx,ts,tsx}",
    "worker-configuration.d.ts",
    "**/_generated/**/*.{js,jsx,ts,tsx}",
  ],
});
