console.log("Loaded Tailwind config");
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte,html}"
  ],
  theme: {
    extend: {
      animation: {
        'meteor-effect': 'meteor 5s linear infinite',
        'fadeIn': 'fadeIn 0.5s ease-in forwards',
        'pulse': 'pulse 2s infinite'
      },
      keyframes: {
        meteor: {
          '0%': { transform: 'rotate(45deg) translateX(0)', opacity: 1 },
          '70%': { opacity: 1 },
          '100%': {
            transform: 'rotate(45deg) translateX(-500px)',
            opacity: 0
          }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      },
    },
  },
  plugins: [],
}
