/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // 3-Color Strict Palette: Primary, Secondary, Tertiary
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Core Primary: Cobalt Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#2563eb',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569', // Core Secondary: Slate Steel Neutral
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          DEFAULT: '#475569',
        },
        tertiary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2', // Core Tertiary: High-Tech Cyber Cyan/Teal
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          DEFAULT: '#0891b2',
        },
        // Legacy network aliases mapped to the 3-color palette
        network: {
          dark: '#0f172a', // secondary-900
          card: '#ffffff', // clean white
          border: '#e2e8f0', // secondary-200
          cyan: '#0891b2', // tertiary-600
          blue: '#2563eb', // primary-600
          purple: '#1d4ed8', // primary-700
          emerald: '#0e7490', // tertiary-700
          rose: '#334155', // secondary-700
        },
      },
    },
  },
  plugins: [],
};
