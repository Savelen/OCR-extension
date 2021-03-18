const Path = require('path');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')
const MiniCss = require("mini-css-extract-plugin");
const MinimiserCss = require('css-minimizer-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProd = process.env.NODE_ENV === "production";

let cssLoaders = (isProd) => {
	let loaders = [MiniCss.loader, 'css-loader'];
	if (isProd) {
		loaders.push({
			loader: "postcss-loader",
			options: {
				postcssOptions: {
					plugins: [Autoprefixer({ grid: 'autoplace' })]
				}
			}
		});
	}
	loaders.push('sass-loader');
	return loaders;
}
let name = ext => "[name].bundle." + ext;
let aliasPath = (alias) => {
	let path = {
		"@src": Path.resolve(__dirname, "src"),
		"@dist": Path.resolve(__dirname, "dist"),
		"@js": Path.resolve(__dirname, "src/js"),
		"@popup": Path.resolve(__dirname, "src/popup"),
		"@audio": Path.resolve(__dirname, "src/audio"),
		"@n_m": Path.resolve(__dirname, "node_modules/"),
	}
	if (alias === "all") return path;
	else {
		alias = alias.split(/[\\/]/);
		let result = path[alias.shift()];
		result = Path.resolve(result, ...alias);
		return result;
	}
}
let fromTo = (from, to = "") => {
	return {
		from: from,
		to: aliasPath("@dist/" + to)
	}
}

// Editing manifest.json (for development)
fs.readFile(aliasPath('@src/manifest.json'), (err, data) => {
	if (err) throw "Problem with read manifest.JSON";
	let manifest = JSON.parse(data);
	if (isProd) {
		manifest.content_security_policy = "script-src 'self' blob:; object-src 'self' blob:;";
		manifest.background.scripts = [
			"981.bundle.js",
			"935.bundle.js",
			"320.bundle.js",
			"js/background.bundle.js"
		];
		manifest.content_scripts[0].js = ["981.bundle.js", "js/tabScript.bundle.js"];
	}
	else {
		manifest.content_security_policy = "script-src-elem  'unsafe-eval' chrome-extension:; script-src  'unsafe-eval' blob:; object-src 'self' blob:;";
		manifest.background.scripts = ["js/background.bundle.js"];
		manifest.content_scripts[0].js = ["js/tabScript.bundle.js"];
	}
	fs.writeFile(aliasPath('@src/manifest.json'), JSON.stringify(manifest), (e) => {
		if (e) throw "Proplem with write file manifest.json";
	});
});

module.exports = {
	entry: {
		"js/background": ["@babel/polyfill", aliasPath('@js/background.js')],
		"popup/popup": ["@babel/polyfill", aliasPath('@popup/popup.js')],
		"js/tabScript": ["@babel/polyfill", aliasPath('@js/tabScript.js')],
	},
	output: {
		filename: name("js"),
		path: aliasPath('@dist', '[name]')
	},
	resolve: {
		alias: aliasPath("all")
	},
	optimization: {
		splitChunks: isProd ? { chunks: 'all' } : {},
		minimize: isProd,
		minimizer: [
			new TerserPlugin({ parallel: true }),
			new MinimiserCss({ parallel: true })
		]
	},
	devServer: {
		port: 3333,
		hot: !isProd
	},
	plugins: [
		new HTMLWebpackPlugin({
			filename: 'popup/popup.html',
			template: aliasPath("@popup/popup.html"),
			chunks: ["popup/popup"],
			minify: {
				collapseWhitespace: isProd
			}
		}),
		new MiniCss({
			filename: name('css')
		}),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				fromTo(aliasPath("@src/icons"), "icons"),
				fromTo(aliasPath("@js/tesseract"), "js/tesseract"),
				fromTo(aliasPath("@src/manifest.json")),
				fromTo(aliasPath("@n_m/tesseract.js/dist/worker.min.js"), "js/tesseract"),
				fromTo(aliasPath("@n_m/tesseract.js/dist/tesseract.min.js"), "js/tesseract"),
				fromTo(aliasPath("@n_m/tesseract.js-core/tesseract-core.wasm.js"), "js/tesseract"),
				fromTo(aliasPath("@audio/successful.ogg"), "audio"),
				fromTo(aliasPath("@audio/fail.ogg"), "audio"),
			]
		})
	],
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ['@babel/preset-env', "@babel/preset-react"],
						plugins: ['@babel/plugin-proposal-class-properties']
					}
				}
			},
			{
				test: /\.s[ac]ss$/,
				use: cssLoaders(isProd)
			}
		]
	}
}