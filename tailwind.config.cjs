const config = {
	mode: "jit",
	darkMode: "class",
	purge: [
		"./src/**/*.{html,js,svelte,ts}",
	],
	theme: {
		fontFamily: {sans: ["Roboto","Open Sans","sans-serif"]},
		extend: {
			colors: {
				light: "#ffffff",
				dark: "#1a1917"
			},
			backgroundColor: {
				"light": "#ffffff",
				"dark": "#1a1917"
			},
			textColor: {
				light: "#ffffff",
				dark: "#222"
			}
		},
	},
	plugins: [],
};

module.exports = config;
