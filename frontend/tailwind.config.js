import { createThemes } from 'tw-colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {

        fontSize: {
            'sm': '12px',
            'base': '14px',
            'xl': '16px',
            '2xl': '20px',
            '3xl': '28px',
            '4xl': '38px',
            '5xl': '50px',
            '6xl': '64px',
        },

        extend: {
            fontFamily: {
              inter: ["'Inter'", "sans-serif"],
              gelasio: ["'Gelasio'", "serif"],
              poppins: ["'Poppins'", "sans-serif"]
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'gradient-accent': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                'gradient-hero': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'card': '0 0 40px -10px rgba(102, 126, 234, 0.25)',
                'elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                'glow': '0 0 40px rgba(102, 126, 234, 0.4)',
                'glow-purple': '0 0 60px rgba(118, 75, 162, 0.3)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'gradient': 'gradient 8s ease infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.6s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            borderRadius: {
                '4xl': '2rem',
            }
        },

    },
    plugins: [
        createThemes({
            light: {
                'white': '#FFFFFF',
                'black': '#1a1a2e',
                'grey': '#F8FAFC',
                'dark-grey': '#64748B',
                'red': '#EF4444',
                'transparent': 'transparent',
                'twitter': '#1DA1F2',
                'purple': '#8B5CF6',
                'primary': '#667eea',
                'secondary': '#764ba2',
                'accent': '#4facfe',
                'surface': '#FFFFFF',
                'muted': '#94A3B8',
            },
            dark: {
                'white': '#1a1a2e',
                'black': '#F8FAFC',
                'grey': '#1e1e32',
                'dark-grey': '#CBD5E1',
                'red': '#DC2626',
                'transparent': 'transparent',
                'twitter': '#0E71A8',
                'purple': '#A78BFA',
                'primary': '#818CF8',
                'secondary': '#C084FC',
                'accent': '#67E8F9',
                'surface': '#252540',
                'muted': '#64748B',
            }
        })
    ],
};