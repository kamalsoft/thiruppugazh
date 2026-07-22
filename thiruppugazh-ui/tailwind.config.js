/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        murugan: {
          saffron: '#FF9933',
          red: '#990000',
          gold: '#D4AF37',
          dark: '#1A0000',
        }
      },
      keyframes: {
        // Hero image: gentle vertical float
        'hero-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
        // Hero image: slow shimmer sweep from left to right
        'shine-slide': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        // Vel: golden glow pulse
        'vel-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #FFD700) drop-shadow(0 0 8px #D4AF37)' },
          '50%':       { filter: 'drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 24px #FFA500)' },
        },
        // Vel: gentle pendulum sway
        'vel-sway': {
          '0%, 100%': { transform: 'rotate(-6deg) translateY(0px)' },
          '25%':       { transform: 'rotate(0deg)  translateY(-3px)' },
          '50%':       { transform: 'rotate(6deg)  translateY(0px)' },
          '75%':       { transform: 'rotate(0deg)  translateY(-3px)' },
        },
        // Card icons: levitate
        'icon-levitate': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%':       { transform: 'translateY(-6px) scale(1.08)' },
        },
      },
      animation: {
        'hero-float':    'hero-float 5s ease-in-out infinite',
        'vel-glow':      'vel-glow 2.5s ease-in-out infinite',
        'vel-sway':      'vel-sway 3.5s ease-in-out infinite',
        'icon-levitate': 'icon-levitate 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
