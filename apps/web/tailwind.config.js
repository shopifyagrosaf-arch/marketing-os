/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Chart surfaces / ink — see docs/DESIGN_SYSTEM.md "UI Preview" section
        // and the dataviz skill's reference palette (references/palette.md).
        surface: {
          DEFAULT: '#fcfcfb',
          page: '#f9f9f7',
          dark: '#1a1a19',
          'dark-page': '#0d0d0d',
        },
        ink: {
          primary: '#0b0b0b',
          secondary: '#52514e',
          muted: '#898781',
          'primary-dark': '#ffffff',
          'secondary-dark': '#c3c2b7',
        },
        line: {
          hairline: '#e1e0d9',
          'hairline-dark': '#2c2c2a',
          axis: '#c3c2b7',
          'axis-dark': '#383835',
        },
        brand: {
          50: '#eef5fd',
          100: '#cde2fb',
          200: '#9ec5f4',
          300: '#6da7ec',
          400: '#3987e5',
          500: '#2a78d6',
          600: '#256abf',
          700: '#184f95',
          800: '#104281',
          900: '#0d366b',
        },
        series: {
          1: '#2a78d6',
          2: '#1baf7a',
          3: '#eda100',
          4: '#008300',
          5: '#4a3aa7',
          6: '#e34948',
          7: '#e87ba4',
          8: '#eb6834',
        },
        status: {
          good: '#0ca30c',
          warning: '#fab219',
          serious: '#ec835a',
          critical: '#d03b3b',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,11,11,0.04), 0 1px 1px rgba(11,11,11,0.03)',
        popover: '0 8px 24px rgba(11,11,11,0.12)',
      },
    },
  },
  plugins: [],
};
