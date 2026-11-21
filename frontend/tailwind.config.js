/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./public/index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // WhatsApp-inspired palette
        wa: {
          green: "#25D366",
          teal: "#075E54",
          chat: "#efeae2",
          sentLight: "#d9fdd3",
          surfaceDark: "#111b21",
          panelDark: "#202c33",
          chatDark: "#0b141a",
          sentDark: "#005c4b",
          recvDark: "#2a3942",
        },
      },
    },
  },
  plugins: [],
};
