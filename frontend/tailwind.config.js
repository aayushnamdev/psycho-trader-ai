/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reflection.app inspired palette
        primary: {
          DEFAULT: '#7C5CFF',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C5CFF',
          600: '#6D4AED',
          700: '#5B37DB',
          800: '#4C2FC4',
          900: '#3E279F',
        },
        background: '#FAFBFF',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
          subtle: '#F5F6FA',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
          muted: '#D1D5DB',
        },
        accent: {
          gold: '#F59E0B',
          success: '#10B981',
          purple: '#7C5CFF',
          rose: '#F43F5E',
        },
        border: {
          DEFAULT: 'rgba(124, 92, 255, 0.1)',
          subtle: 'rgba(124, 92, 255, 0.06)',
          visible: 'rgba(124, 92, 255, 0.15)',
        },
      },
      fontFamily: {
        sans: [
          'DM Sans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        serif: [
          'Georgia',
          'Times New Roman',
          'serif',
        ],
      },
      fontSize: {
        'xs': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'sm': ['0.8125rem', { lineHeight: '1.5' }],
        'base': ['0.9375rem', { lineHeight: '1.6' }],
        'lg': ['1.0625rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 32px rgba(124, 92, 255, 0.08)',
        'xl': '0 16px 48px rgba(124, 92, 255, 0.12)',
        'glow': '0 0 40px rgba(124, 92, 255, 0.15)',
        'glow-sm': '0 0 20px rgba(124, 92, 255, 0.1)',
        'inner-glow': 'inset 0 1px 2px rgba(255, 255, 255, 0.8)',
      },
      borderRadius: {
        'sm': '8px',
        'DEFAULT': '12px',
        'md': '14px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      backdropBlur: {
        'xs': '4px',
        'sm': '8px',
        'DEFAULT': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-down': 'fadeDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      spacing: {
        'sidebar': '72px',
        'sidebar-expanded': '240px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
