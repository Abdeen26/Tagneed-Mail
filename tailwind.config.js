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
        background: "var(--background)",
        foreground: "var(--foreground)",
        maincolor: "var(--maincolor)",
        secondcolor: "var(--secondcolor)",
        thirdcolor: "var(--thirdcolor)",
        fourthcolor: "var(--fourthcolor)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: false, // <-- disables DaisyUI's color overrides
  },
};
