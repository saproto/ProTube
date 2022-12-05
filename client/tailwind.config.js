module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class' or false
  theme: {
    extend: {
      colors: {
        // main bright green of proto
        proto_green: "#83B716",
        // the blue color of proto (used in buttons mainly)
        proto_blue: "#00AAC0",
        // the gray tones used in backgrounds
        proto_background_gray: {
          DEFAULT: "#f1f1f1",
          dark: "#424242",
        },
        // the gray tones used in the searchwrapper, basically everything in a contentfield.vue
        proto_secondary_gray: {
          DEFAULT: "#fff",
          dark: "#303030",
        },
        // colors used specifically in the search button of the remote
        search_button_border: "#007d8d",
        search_button_background: {
          light: "#e9ecef",
          DEFAULT: "#00889a",
          dark: "#424242",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
