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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: {
					DEFAULT: 'hsl(var(--border))',
					hover: 'hsl(var(--border-hover))',
					accent: 'hsl(var(--border-accent))',
					glow: 'hsl(var(--border-glow))',
				},
				input: {
					DEFAULT: 'hsl(var(--input))',
					border: 'hsl(var(--input-border))',
				},
				ring: 'hsl(var(--ring))',
				background: {
					DEFAULT: 'hsl(var(--background))',
					secondary: 'hsl(var(--background-secondary))',
					tertiary: 'hsl(var(--background-tertiary))',
					overlay: 'hsl(var(--background-overlay))',
				},
				foreground: {
					DEFAULT: 'hsl(var(--foreground))',
					secondary: 'hsl(var(--foreground-secondary))',
					muted: 'hsl(var(--foreground-muted))',
					accent: 'hsl(var(--foreground-accent))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))',
					hover: 'hsl(var(--primary-hover))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					hover: 'hsl(var(--accent-hover))',
					foreground: 'hsl(var(--accent-foreground))',
					bright: 'hsl(var(--accent-bright))',
				},
				glass: {
					background: 'hsl(var(--glass-background))',
					border: 'hsl(var(--glass-border))',
					shadow: 'hsl(var(--glass-shadow))',
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					light: 'hsl(var(--success-light))',
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					light: 'hsl(var(--warning-light))',
				},
				error: {
					DEFAULT: 'hsl(var(--error))',
					light: 'hsl(var(--error-light))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				info: 'hsl(var(--info))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))',
					glow: 'hsl(var(--sidebar-glow))',
				},
				metric: {
					blue: 'hsl(var(--metric-blue))',
					cyan: 'hsl(var(--metric-cyan))',
					violet: 'hsl(var(--metric-violet))',
					emerald: 'hsl(var(--metric-emerald))',
					amber: 'hsl(var(--metric-amber))',
					rose: 'hsl(var(--metric-rose))',
				},
				card: {
					DEFAULT: 'hsl(var(--card-background))',
					border: 'hsl(var(--card-border))',
					glow: 'hsl(var(--card-glow))',
					hover: 'hsl(var(--card-hover))',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 0.25rem)',
				sm: 'calc(var(--radius) - 0.5rem)',
				'radius-sm': 'var(--radius-sm)',
				'radius-lg': 'var(--radius-lg)',
				'radius-xl': 'var(--radius-xl)',
			},
			fontFamily: {
				sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
				display: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
				'5xl': ['3rem', { lineHeight: '3.5rem', fontWeight: '800' }],
			},
			backdropBlur: {
				'xs': '2px',
				'3xl': '64px',
			},
			animation: {
				// Enhanced fade animations
				'fade-in': 'fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-out': 'fadeOut 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				
				// Premium slide animations
				'slide-up': 'slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'slide-down': 'slideDown 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'slide-left': 'slideLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'slide-right': 'slideRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				
				// Scale and transform animations
				'scale-in': 'scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'scale-out': 'scaleOut 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'zoom-in': 'zoomIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				
				// Glow and shine effects
				'glow': 'glow 2s ease-in-out infinite alternate',
				'shine': 'shine 2s linear infinite',
				'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				
				// Float and wiggle
				'float': 'float 3s ease-in-out infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				
				// Gradient animations
				'gradient-x': 'gradientX 3s ease infinite',
				'gradient-y': 'gradientY 3s ease infinite',
				'gradient-xy': 'gradientXY 3s ease infinite',
				
				// Premium entrance animations
				'enter-from-right': 'enterFromRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'enter-from-left': 'enterFromLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'enter-from-top': 'enterFromTop 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'enter-from-bottom': 'enterFromBottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				
				// Mobile menu animations
				'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			},
			keyframes: {
				// Basic fade animations
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				fadeInUp: {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				fadeInDown: {
					'0%': { opacity: '0', transform: 'translateY(-30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				fadeOut: {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(-10px)' },
				},
				
				// Slide animations
				slideUp: {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				slideDown: {
					'0%': { opacity: '0', transform: 'translateY(-20px)' },
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
				
				// Scale animations
				scaleIn: {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				scaleOut: {
					'0%': { opacity: '1', transform: 'scale(1)' },
					'100%': { opacity: '0', transform: 'scale(0.9)' },
				},
				zoomIn: {
					'0%': { opacity: '0', transform: 'scale(0.5)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				
				// Glow effects
				glow: {
					'0%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.2)' },
					'100%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.4)' },
				},
				shine: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				},
				pulseGlow: {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.6)' },
				},
				
				// Float and wiggle
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				wiggle: {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(1deg)' },
					'75%': { transform: 'rotate(-1deg)' },
				},
				
				// Gradient animations
				gradientX: {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
				},
				gradientY: {
					'0%, 100%': { backgroundPosition: '50% 0%' },
					'50%': { backgroundPosition: '50% 100%' },
				},
				gradientXY: {
					'0%, 100%': { backgroundPosition: '0% 0%' },
					'25%': { backgroundPosition: '100% 0%' },
					'50%': { backgroundPosition: '100% 100%' },
					'75%': { backgroundPosition: '0% 100%' },
				},
				
				// Entrance animations
				enterFromRight: {
					'0%': { opacity: '0', transform: 'translateX(50px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				enterFromLeft: {
					'0%': { opacity: '0', transform: 'translateX(-50px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				enterFromTop: {
					'0%': { opacity: '0', transform: 'translateY(-50px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				enterFromBottom: {
					'0%': { opacity: '0', transform: 'translateY(50px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				
				// Mobile menu slide in from right
				slideInRight: {
					'0%': { opacity: '0', transform: 'translateX(100%)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;