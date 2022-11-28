const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./public/index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  //mode: 'jit',
  darkMode: 'media', // or 'media' or 'class' or false
  theme: {
    extend: {
      colors: {
        proto_green: '#83B716',
        // true_gray: colors.trueGray,
        proto_blue: '#00AAC0',
        proto_background_gray: {
          DEFAULT: '#f1f1f1',
          dark: '#424242'
        },
        proto_secondary_gray: {
          DEFAULT: '#fff',
          dark: '#303030'
        },
        search_button_border: '#007d8d',
        search_button_background: {
          light: '#e9ecef',
          DEFAULT: '#00889a',
          dark: '#424242'
        },
      },
    },
  },
  variants: {
    extend: {
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}