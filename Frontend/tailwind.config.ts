// Tailwind v4: configuration is handled in globals.css via @theme
// This file kept for IDE / tooling compatibility
import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
}
export default config
