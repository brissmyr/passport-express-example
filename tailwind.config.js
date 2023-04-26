module.exports = {
  content: ["./src/**/*.{html,js}"],
  purge: {
    content: ['./views/**/*.ejs', './src/**/*.js'],
    options: { safelist: [] },
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
