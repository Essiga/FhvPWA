/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./dist/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}

