
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: { DEFAULT: '1.25rem', md: '2rem' },
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				ash: 'hsl(var(--ash))',
				board: 'hsl(var(--board))',
				ink: 'hsl(var(--ink))',
				steel: 'hsl(var(--steel))',
				teak: {
					DEFAULT: 'hsl(var(--teak))',
					deep: 'hsl(var(--teak-deep))',
					tint: 'hsl(var(--teak-tint))'
				},
				walnut: 'hsl(var(--walnut))',
				navy: 'hsl(var(--navy))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				sans: ['"Hanken Grotesk Variable"', 'system-ui', 'sans-serif'],
				display: ['"Archivo Variable"', '"Hanken Grotesk Variable"', 'system-ui', 'sans-serif'],
				// Older pages use font-serif for headings; it now maps to the display face.
				serif: ['"Archivo Variable"', '"Hanken Grotesk Variable"', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				slideUp: {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
				slideDown: {
					from: { transform: 'translateY(-10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
				slideInLeft: {
					from: { transform: 'translateX(-20px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' },
				},
				slideInRight: {
					from: { transform: 'translateX(20px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' },
				},
				scale: {
					from: { transform: 'scale(0.98)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' },
				},
				zoomIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				floatUp: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				fadeIn: 'fadeIn 0.5s ease-out',
				slideUp: 'slideUp 0.5s ease-out',
				slideDown: 'slideDown 0.5s ease-out',
				slideInLeft: 'slideInLeft 0.5s ease-out',
				slideInRight: 'slideInRight 0.5s ease-out',
				scale: 'scale 0.3s ease-out',
				zoomIn: 'zoomIn 0.3s ease-out',
				floatUp: 'floatUp 3s ease-in-out infinite',
				marquee: 'marquee var(--marquee-duration, 40s) linear infinite',
			},
			transitionTimingFunction: {
				'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
				'in-out-quart': 'cubic-bezier(0.65, 0, 0.35, 1)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			},
			boxShadow: {
				'soft': '0 1px 2px hsl(220 10% 10% / 0.05), 0 8px 24px -8px hsl(220 10% 10% / 0.10)',
				'hover': '0 2px 4px hsl(220 10% 10% / 0.06), 0 18px 40px -12px hsl(220 10% 10% / 0.22)',
				'chip': '0 1px 1px hsl(220 10% 10% / 0.10), 0 10px 22px -10px hsl(220 10% 10% / 0.45)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
