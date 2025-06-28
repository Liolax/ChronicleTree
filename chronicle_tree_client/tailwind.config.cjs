// tailwind.config.cjs
module.exports = {
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'app-bg':        '#F8F4F0',
        'app-container': '#FEFEFA',
        'app-primary':   '#4A4A4A',
        'app-accent':    '#A0C49D',
        'button-primary':'#4F868E',
        'link':          '#4F868E'
      }
    },
  },
  plugins: [],
}
