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
        "slate-custom": "#0f172a",
        // Portal Specific Colors (Variable-Based Orange Branding)
        "portal-primary": {
          DEFAULT: "var(--portal-primary)",
          hover: "var(--portal-primary-hover)",
          light: "var(--portal-primary-light)",
        },
        "portal-cardbg": "var(--portal-cardbg)",
        "portal-bg": "var(--portal-bg)",
        "portal-textprimary": "var(--portal-textprimary)",
        "portal-textsecondary": "var(--portal-textsecondary)",
        "portal-textmuted": "var(--portal-textmuted)",
        "portal-border": "var(--portal-border)",
        "portal-inputbg": "var(--portal-inputbg)",
        "portal-sidebar": {
          DEFAULT: "var(--portal-sidebar)",
          hover: "var(--portal-sidebar-hover)",
          active: "var(--portal-sidebar-active)",
        },
        "portal-navy": "var(--portal-navy)",
        "portal-success": "var(--portal-success)",
        "portal-warning": "var(--portal-warning)",
        "portal-danger": "var(--portal-danger)",
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [],
};
