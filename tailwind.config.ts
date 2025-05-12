
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
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
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
  			},
        subtleFlash: { // Defined in globals.css
          '0%, 100%': { backgroundColor: 'hsl(var(--primary) / 0.1)' },
          '12.5%': { backgroundColor: '#f4d97626' },
          '25%':   { backgroundColor: '#deb95226' },
          '37.5%': { backgroundColor: '#c4962f26' },
          '50%':   { backgroundColor: '#00ab8f26' },
          '62.5%': { backgroundColor: '#8c8c8c26' },
          '75%':   { backgroundColor: '#8fd0f626' },
          '87.5%': { backgroundColor: '#14223b26' },
        }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'subtle-flash': 'subtleFlash 20s ease-in-out infinite',
  		},
      typography: ({ theme }: { theme: any }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.foreground'),
            a: {
              color: theme('colors.primary.DEFAULT'),
              '&:hover': {
                color: theme('colors.primary.DEFAULT / 0.9'),
              },
            },
            'h1, h2, h3, h4': {
              color: theme('colors.foreground'),
            },
            p: {
              color: theme('colors.muted.foreground'),
              'white-space': 'pre-line',
            },
            strong: {
              color: theme('colors.foreground'),
            },
            ul: {
              '> li::before': { backgroundColor: theme('colors.primary.DEFAULT') },
            },
            ol: {
              '> li::before': { color: theme('colors.primary.DEFAULT') },
            },
            blockquote: {
              color: theme('colors.muted.foreground'),
              borderLeftColor: theme('colors.border'),
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.foreground'),
             a: {
              color: theme('colors.primary.DEFAULT'), // Or a brighter primary for dark mode
              '&:hover': {
                color: `hsl(var(--primary) / 0.8)`,
              },
            },
            'h1, h2, h3, h4': {
              color: theme('colors.foreground'),
            },
            p: {
              color: theme('colors.muted.foreground'),
            },
            strong: {
              color: theme('colors.foreground'),
            },
             ul: {
              '> li::before': { backgroundColor: theme('colors.primary.DEFAULT') },
            },
            ol: {
              '> li::before': { color: theme('colors.primary.DEFAULT') },
            },
            blockquote: {
              color: theme('colors.muted.foreground'),
              borderLeftColor: theme('colors.border'),
            },
          },
        },
      }),
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography')
  ],
} satisfies Config;
