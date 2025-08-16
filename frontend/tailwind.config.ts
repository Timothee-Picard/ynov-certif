import type { Config } from 'tailwindcss'

const tailwindConfig: Config = {
	content: ['./app/**/*.{js,ts,jsx,tsx}'],
	theme: { extend: {} },
	plugins: [],
	// @ts-ignore
	compiler: 'js',
}

export default tailwindConfig
