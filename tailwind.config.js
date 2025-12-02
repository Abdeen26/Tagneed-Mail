/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        maincolor: "var(--color-maincolor)",
        secondcolor: "var(--color-secondcolor)",
        thirdcolor: "var(--color-thirdcolor)",
        fourthcolor: "var(--color-fourthcolor)",
      },
      fontFamily: {
        sans: ["Fredoka", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: false,
  },
};
