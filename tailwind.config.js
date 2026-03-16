/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
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
  		keyframes: {
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
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  safelist: [
    // Badge backgrounds & text
    'bg-blue-100','text-blue-700','border-blue-200','from-blue-500','to-blue-600','bg-blue-50','shadow-blue-100',
    'bg-amber-100','text-amber-700','border-amber-200','from-amber-400','to-yellow-500','bg-amber-50','shadow-amber-100','from-amber-500','to-amber-600',
    'bg-orange-100','text-orange-700','border-orange-200','from-orange-500','to-orange-600','bg-orange-50','shadow-orange-100',
    'bg-teal-100','text-teal-700','border-teal-200','from-teal-500','to-teal-600','bg-teal-50','shadow-teal-100',
    'bg-red-100','text-red-700','border-red-200','from-red-500','to-red-600','bg-red-50','shadow-red-100',
    'bg-green-100','text-green-700','border-green-200','from-green-500','to-green-600','bg-green-50','shadow-green-100',
    'bg-emerald-100','text-emerald-700','border-emerald-200','from-emerald-500','to-emerald-600','bg-emerald-50','shadow-emerald-100',
    'bg-cyan-100','text-cyan-700','border-cyan-200','from-cyan-500','to-cyan-600','bg-cyan-50','shadow-cyan-100',
    'bg-purple-100','text-purple-700','border-purple-200','from-purple-500','to-purple-600','bg-purple-50','shadow-purple-100',
    'bg-indigo-100','text-indigo-700','border-indigo-200','from-indigo-500','to-indigo-600','bg-indigo-50','shadow-indigo-100',
    'bg-rose-100','text-rose-700','border-rose-200','from-rose-500','to-rose-600','bg-rose-50','shadow-rose-100',
    'bg-lime-100','text-lime-700','border-lime-200','from-lime-500','to-lime-600','bg-lime-50','shadow-lime-100',
    'bg-pink-100','text-pink-700','border-pink-200','from-pink-500','to-pink-600','bg-pink-50','shadow-pink-100',
  ],
  plugins: [require("tailwindcss-animate")],
}