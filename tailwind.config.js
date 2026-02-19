/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#197fe6",
        "background-light": "#f6f7f8",
        "background-dark": "#111921",
        "aws-orange": "#ff9900",
        "slate-custom": "#0f172a"
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [],
};
