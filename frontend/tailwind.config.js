/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        network: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          cyan: '#06B6D4',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          emerald: '#10B981',
          rose: '#F43F5E',
        },
      },
    },
  },
  plugins: [],
};
