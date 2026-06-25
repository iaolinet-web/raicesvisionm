tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
                poppins: ['Poppins', 'sans-serif'],
            },
            colors: {
                black: '#020617',
                brand: { light: '#f8fafc', muted: '#94a3b8', dark: '#1e293b', darker: '#0f172a' },
                accent: { DEFAULT: '#f02e85', hover: '#d91c6e' },
                slate: { 800: '#1e293b', 900: '#0f172a', 700: '#334155' },
                magenta: { 500: '#d946ef', 600: '#c026d3' }
            },
            keyframes: {
                ripple: { to: { transform: 'scale(4)', opacity: '0' } },
                fadeInUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" }
                },
                'pulse-ring': {
                    '0%': { transform: 'scale(0.8)', opacity: '0.8' },
                    '100%': { transform: 'scale(2.5)', opacity: '0' },
                },
                'wiggle-more': {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '5%, 15%, 25%': { transform: 'rotate(-15deg)' },
                    '10%, 20%, 30%': { transform: 'rotate(15deg)' },
                    '35%': { transform: 'rotate(0deg)' },
                }
            },
            animation: {
                ripple: 'ripple 0.6s linear',
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'float': 'float 3s ease-in-out infinite',
                'blob': 'blob 7s infinite',
                'pulse-ring': 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
                'wiggle-more': 'wiggle-more 4s ease-in-out infinite',
            }
        }
    }
};