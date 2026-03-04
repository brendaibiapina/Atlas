import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                atlas: {
                    graphite: '#1f2f36',
                    navy: '#194953',
                    midnight: '#12363e',
                    gold: '#b18943',
                    'gold-light': '#d4b06c',
                    'gold-dark': '#8a672f',
                    petrol: '#1f6c75',
                    'petrol-deep': '#174f58',
                    'petrol-light': '#2d7e87',
                    'petrol-soft': '#3b949d',
                    verdant: '#3a7f67',
                    'verdant-soft': '#dcefe7',
                    surface: '#f6f3ea',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
                serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "gradient-gold": "linear-gradient(135deg, #b18943, #d4b06c)",
                "gradient-graphite": "linear-gradient(180deg, #1f2f36, #194953)",
                "gradient-petrol": "linear-gradient(170deg, #174f58 0%, #1f6c75 50%, #2d7e87 100%)",
                "gradient-mesh": "radial-gradient(ellipse at 30% 20%, rgba(45,126,135,0.28) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(177,137,67,0.08) 0%, transparent 50%)",
            },
            boxShadow: {
                'atlas-sm': '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15)',
                'atlas-md': '0 4px 12px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15)',
                'atlas-lg': '0 10px 30px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
                'atlas-gold': '0 4px 20px rgba(177,137,67,0.2)',
                'atlas-glow': '0 0 25px rgba(177,137,67,0.25)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'shimmer': 'shimmer 2s infinite',
                'pulse-gold': 'pulse-gold 2s infinite',
                'float': 'float 3s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
export default config;
