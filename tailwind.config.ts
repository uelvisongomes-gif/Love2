import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: { center: true, padding: '1.5rem' },
    extend: {
      colors: {
        bg: 'hsl(var(--bg) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        text: 'hsl(var(--text) / <alpha-value>)',
        heading: 'hsl(var(--heading) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-fg) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-fg) / <alpha-value>)',
        },
        rule: 'hsl(var(--rule) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Times New Roman', 'serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 0.25rem)',
        sm: 'calc(var(--radius) - 0.4rem)',
      },
      boxShadow: {
        soft: '0 1px 2px hsl(var(--heading) / 0.04), 0 4px 20px hsl(var(--heading) / 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
