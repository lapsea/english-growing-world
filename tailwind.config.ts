import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#FFD429',
        ink: '#171717',
        paper: '#F7F4EC',
        card: '#FFFFFF',
        blue: '#3478F6',
        coral: '#F05A47',
        lav: '#A996E8',
        ice: '#A9DDF5',
      },
      fontFamily: {
        display: ['"Baloo 2"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        body: ['Nunito', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        nbr: '24px',
        'nbr-sm': '20px',
        'nbr-lg': '28px',
        'nbr-xl': '32px',
      },
      boxShadow: {
        hard: '3.5px 3.5px 0 0 #171717',
        'hard-sm': '2.5px 2.5px 0 0 #171717',
        'hard-lg': '6px 6px 0 0 #171717',
        'hard-xs': '1.5px 1.5px 0 0 #171717',
        'hard-blue': '3.5px 3.5px 0 0 #3478F6',
        'hard-coral': '3.5px 3.5px 0 0 #F05A47',
        'hard-lav': '3.5px 3.5px 0 0 #A996E8',
        'hard-ice': '3.5px 3.5px 0 0 #A9DDF5',
      },
    },
  },
  plugins: [],
} satisfies Config
