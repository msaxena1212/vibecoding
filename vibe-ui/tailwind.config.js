/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                'cosmic-bg': '#0a0a0f',
                'cosmic-card': '#13131f',
                'cosmic-accent': '#6366f1',
                'cosmic-text': '#e0e7ff',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.4s ease-out forwards',
                'slide-left': 'slideLeft 0.3s ease-out forwards',
                'slide-right': 'slideRight 0.3s ease-out forwards',
                'pulse-glow': 'pulse-glow 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideLeft: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideRight: {
                    '0%': { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'pulse-glow': {
                    '0%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.4)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(99, 102, 241, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' },
                },
            },
        },
    },
    plugins: [],
}
