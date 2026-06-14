/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        porcelain: {
          cream: '#fbf7f0',
          rim: '#dce4ef',
        },
        cobalt: {
          DEFAULT: '#3d5a80',
          deep: '#2a4060',
          glaze: '#4a6fa5',
          light: '#6b8fc4',
        },
        clay: {
          DEFAULT: '#c4725a',
          deep: '#a85a44',
          light: '#e8b49a',
        },
        linen: {
          DEFAULT: '#f3ebe0',
          dark: '#e8dfd2',
        },
        ink: '#1a2744',
        stitch: '#b8a898',
        yarn: {
          blush: '#e8cfc4',
          sage: '#b8c4b0',
        },
        coral: {
          DEFAULT: '#c4725a',
          light: '#e8b49a',
          dark: '#a85a44',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      fontFamily: {
        sans: ['"Outfit Variable"', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        soft: '0 4px 28px -6px rgba(26, 39, 68, 0.14)',
        porcelain:
          'inset 0 3px 0 hsl(40 75% 100%), 0 7px 0 hsl(218 20% 84%), 0 14px 32px -10px rgba(26, 39, 68, 0.2)',
        clay: 'inset 0 3px 0 rgba(255,255,255,0.28), 0 6px 0 hsl(16 42% 36%), 0 10px 24px -8px rgba(168,90,68,0.5)',
        cobalt:
          'inset 0 3px 0 rgba(255,255,255,0.18), 0 6px 0 hsl(218 42% 23%), 0 10px 24px -8px rgba(42,64,96,0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.45s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        pop: 'pop 0.25s ease-out',
        'total-pulse': 'totalPulse 0.55s cubic-bezier(0.34, 1.3, 0.64, 1)',
        'float-gentle': 'float-gentle 4.5s ease-in-out infinite',
        'wobble-soft': 'wobble-soft 3s ease-in-out infinite',
        'stamp-in': 'stamp-in 0.45s cubic-bezier(0.34, 1.4, 0.64, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
