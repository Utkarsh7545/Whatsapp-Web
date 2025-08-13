/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // WhatsApp color scheme
        'whatsapp-green': {
          DEFAULT: '#25D366',
          light: '#DCF8C6',
          dark: '#128C7E'
        },
        'whatsapp-gray': {
          DEFAULT: '#E5DDD5',
          light: '#F0F0F0',
          dark: '#4A4A4A'
        }
      }
    },
  },
  plugins: [],
}
