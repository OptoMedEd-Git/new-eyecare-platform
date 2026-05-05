import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

/** Typography plugin + content globs for tooling; Tailwind v4 still reads `@import "tailwindcss"` from CSS. */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [typography],
} satisfies Config;
