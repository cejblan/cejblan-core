/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		spacing: {
			'0': '0rem',
			'1': '0.5rem',
			'2': '1rem',
			'3': '1.5rem',
			'4': '2rem',
			'5': '2.5rem',
			'6': '3rem',
			'7': '3.5rem',
			'8': '4rem',
			'9': '4.5rem',
			'10': '5rem',
			'11': '5.5rem',
			'12': '6rem',
			'14': '7rem',
			'16': '8rem',
			'20': '9rem',
			'24': '10rem',
			'28': '11rem',
			'32': '12rem',
			'36': '13rem',
			'40': '14rem',
			'44': '15rem',
			'48': '16rem',
			'52': '17rem',
			'56': '18rem',
			'60': '19rem',
			'64': '20rem',
			'68': '21rem',
			'72': '22rem',
			'76': '23rem',
			'80': '24rem',
			'84': '25rem',
			'88': '30rem',
			'92': '40rem',
			'0.5': '0.3rem'
		},
		extend: {
			boxShadow: {
				'3xl': '0px -3px 12px 1px black',
				'4xl': '0px -3px 12px -3px black',
				'5xl': '-3px 0px 21px -6px black',
				'6xl': '0px 0px 6px -1px black',
				'7xl': '0px 0px 30px 6px white',
				'8xl': '0px 0px 12px 0px white'
			},
			dropShadow: {
				'6xl': '0px 0px 6px rgb(0 0 0)',
				'7xl': '0px 0px 6px rgb(255 255 255)'
			},
			gridTemplateColumns: {
				'18': 'repeat(18, minmax(0, 1fr))'
			},
			gridColumnStart: {
				'13': '13',
				'18': '18'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
			},
			minWidth: {
				'1': '0.5rem',
				'2': '1rem',
				'3': '1.5rem',
				'4': '2rem',
				'5': '2.5rem',
				'6': '3rem',
				'7': '3.5rem',
				'8': '4rem',
				'9': '4.5rem',
				'10': '5rem',
				'11': '5.5rem',
				'12': '6rem',
				'14': '7rem',
				'16': '8rem',
				'20': '9rem',
				'24': '10rem',
				'28': '11rem',
				'32': '12rem',
				'36': '13rem',
				'40': '14rem',
				'44': '15rem',
				'48': '16rem',
				'52': '17rem',
				'56': '18rem',
				'60': '19rem',
				'64': '20rem',
				'68': '21rem',
				'72': '22rem',
				'76': '23rem',
				'80': '24rem',
				'84': '25rem',
				'88': '30rem',
				'92': '40rem'
			},
			minHeight: {
				'1': '0.5rem',
				'2': '1rem',
				'3': '1.5rem',
				'4': '2rem',
				'5': '2.5rem',
				'6': '3rem',
				'7': '3.5rem',
				'8': '4rem',
				'9': '4.5rem',
				'10': '5rem',
				'11': '5.5rem',
				'12': '6rem',
				'14': '7rem',
				'16': '8rem',
				'20': '9rem',
				'24': '10rem',
				'28': '11rem',
				'32': '12rem',
				'36': '13rem',
				'40': '14rem',
				'44': '15rem',
				'48': '16rem',
				'52': '17rem',
				'56': '18rem',
				'60': '19rem',
				'64': '20rem',
				'68': '21rem',
				'72': '22rem',
				'76': '23rem',
				'80': '24rem',
				'84': '25rem',
				'88': '30rem',
				'92': '40rem'
			},
			keyframes: {
				dots: {
					'5%, 20%': {
						opacity: '0'
					},
					'50%, 100%': {
						opacity: '1'
					}
				}
			},
			animation: {
				dots: 'dots 1s steps(5, end) infinite'
			},
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
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
