/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			/* Coachwork navy. Overrides Tailwind's stock blue so every existing
  			   bg-blue-600 renders as paint, not as a SaaS button. */
  			blue: {
  				'50': '#F2F5F8',
  				'100': '#E2E9F0',
  				'200': '#C4D0DC',
  				'300': '#9BAEC2',
  				'400': '#5E7D9C',
  				'500': '#2E5377',
  				'600': '#1B3B5A',
  				'700': '#142C44',
  				'800': '#0F2234',
  				'900': '#0A1824',
  				'950': '#060F17'
  			},
  			/* Neutral grey with the blue cast taken out. Same lightness ramp as
  			   Tailwind slate, so every existing contrast relationship holds. */
  			slate: {
  				'50': '#F7F7F8',
  				'100': '#EFEFF0',
  				'200': '#E3E3E5',
  				'300': '#C9C9CC',
  				'400': '#9B9CA0',
  				'500': '#74757A',
  				'600': '#585A5F',
  				'700': '#414349',
  				'800': '#2A2C31',
  				'900': '#16181C',
  				'950': '#0C0D10'
  			},
  			ink: '#0D1F2D',
  			brass: {
  				DEFAULT: '#9C7C38',
  				light: '#C2A264',
  				dark: '#6E561F'
  			},
  			paper: '#F4F3F0',
  			line: '#DAD8D3',
  			primary: {
  				'50': '#eff6ff',
  				'100': '#dbeafe',
  				'200': '#bfdbfe',
  				'300': '#93c5fd',
  				'400': '#60a5fa',
  				'500': '#3b82f6',
  				'600': '#2563eb',
  				'700': '#1d4ed8',
  				'800': '#1e40af',
  				'900': '#1e3a8a'
  			},
  			secondary: {
  				'50': '#f8fafc',
  				'100': '#f1f5f9',
  				'200': '#e2e8f0',
  				'300': '#cbd5e1',
  				'400': '#94a3b8',
  				'500': '#64748b',
  				'600': '#475569',
  				'700': '#334155',
  				'800': '#1e293b',
  				'900': '#0f172a'
  			},
  			accent: {
  				'50': '#fef7ee',
  				'100': '#fdedd4',
  				'200': '#fbd7a9',
  				'300': '#f8bb72',
  				'400': '#f5953a',
  				'500': '#f3771e',
  				'600': '#e45d13',
  				'700': '#bd4512',
  				'800': '#963715',
  				'900': '#792f15'
  			},
  			success: {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#22c55e',
  				'600': '#16a34a',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#14532d'
  			},
  			warning: {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f'
  			},
  			error: {
  				'50': '#fef2f2',
  				'100': '#fee2e2',
  				'200': '#fecaca',
  				'300': '#fca5a5',
  				'400': '#f87171',
  				'500': '#ef4444',
  				'600': '#dc2626',
  				'700': '#b91c1c',
  				'800': '#991b1b',
  				'900': '#7f1d1d'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'var(--font-display)',
  				'Georgia',
  				'serif'
  			]
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1rem'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '2.5rem'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'6xl': [
  				'3.75rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'7xl': [
  				'4.5rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'8xl': [
  				'6rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'9xl': [
  				'8rem',
  				{
  					lineHeight: '1'
  				}
  			]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem'
  		},
  		borderRadius: {
  			none: '0',
  			sm: '1px',
  			DEFAULT: '2px',
  			md: '2px',
  			lg: '3px',
  			xl: '4px',
  			'2xl': '6px',
  			'3xl': '8px',
  			'4xl': '10px',
  			'5xl': '12px',
  			full: '9999px'
  		},
  		boxShadow: {
  			soft: '0 1px 2px rgba(13, 31, 45, 0.04)',
  			medium: '0 1px 3px rgba(13, 31, 45, 0.06), 0 8px 24px -16px rgba(13, 31, 45, 0.18)',
  			large: '0 2px 6px rgba(13, 31, 45, 0.06), 0 24px 48px -28px rgba(13, 31, 45, 0.28)',
  			'xl-soft': '0 2px 8px rgba(13, 31, 45, 0.05), 0 32px 64px -32px rgba(13, 31, 45, 0.22)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.6s ease-in-out',
  			'slide-in-left': 'slideInLeft 0.6s ease-out',
  			'slide-in-right': 'slideInRight 0.6s ease-out',
  			'bounce-soft': 'bounceSoft 2s infinite',
  			'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideInLeft: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			slideInRight: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			bounceSoft: {
  				'0%, 100%': {
  					transform: 'translateY(-5%)'
  				},
  				'50%': {
  					transform: 'translateY(0)'
  				}
  			},
  			pulseSoft: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '.8'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  			'gradient-secondary': 'linear-gradient(135deg, #64748b 0%, #334155 100%)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}