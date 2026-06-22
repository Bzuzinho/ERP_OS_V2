/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.{html,js,jsx,ts,tsx}",
    "./app/**/*.php",
  ],
  theme: {
    extend: {
      colors: {
        // Cada sombra usa uma CSS variable com o valor rgb() completo.
        // As variables são injectadas pelo app.blade.php (Blade) e pelo AdminLayout.tsx (JS).
        primary: {
          50:  'var(--p-50)',
          100: 'var(--p-100)',
          200: 'var(--p-200)',
          300: 'var(--p-300)',
          400: 'var(--p-400)',
          500: 'var(--p-500)',
          600: 'var(--p-600)',
          700: 'var(--p-700)',
          800: 'var(--p-800)',
          900: 'var(--p-900)',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
