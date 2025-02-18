const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const workspace = path.resolve(__dirname);

const scriptOutputRoot = 'build/scripts';

const entries = {
	'platform.dev': {
		input: 'src/framework/platform/dev/platform.dev.ts',
		path: scriptOutputRoot,
		filename: 'platform.dev.js'
	},
	'platform.web': {
		input: 'src/framework/platform/web/platform.web.ts',
		path: scriptOutputRoot,
		filename: 'platform.web.js'
	},

	'platform.wechat': {
		input: 'src/framework/platform/wechat/index.ts',
		path: scriptOutputRoot,
		filename: 'platform.wechat.js'
	},

	'platform.kuaishou': {
		input: 'src/framework/platform/kuaishou/index.ts',
		path: scriptOutputRoot,
		filename: 'platform.kuaishou.js'
	}
};
entries['all'] = Object.values(entries);

module.exports = (env) => {
	if (!env) {
		env = {
			production: false,
			analyze: false,
			target: 'es6',
			esbuild: true,
			entry: 'bundle',
			obfuscate: false,
			minimize: false,
		};
	}
	env.production = JSON.parse(env.production || 'false');
	env.analyze = JSON.parse(env.analyze || 'false');
	env.esbuild = JSON.parse(env.esbuild || 'true');
	env.entry = env.entry || 'bundle';
	env.target = env.target || 'es6';
	env.minimize = env.minimize === false || env.minimize === 'false' ? false : env.production;
	env.obfuscate = (env.obfuscate == false || env.obfuscate == 'false' || !env.minimize) ? false : env.production;
	console.log('Compile config:', env);

	if (env.overrideOptions) {
		env.overrideOptions = JSON.parse(fs.readFileSync(env.overrideOptions, 'utf-8'));
	}

	const tsConfigFile = path.join(workspace, 'tsconfig.json');
	if (env.target) {
		try {
			const tsconfig = JSON.parse(fs.readFileSync(tsConfigFile).toString('utf-8'));
			tsconfig.compilerOptions.target = env.target;
			fs.writeFileSync(tsConfigFile, JSON.stringify(tsconfig, undefined, '\t'));
		} catch (error) {
			console.warn('修改 tsconfig.json 失败', error?.message);
		}
	}

	const targets = entries[env.entry];
	if (!targets) throw new Error(`未找到构建配置: ${env.entry}`);
	const options = Array.isArray(targets) ? targets : [targets];
	const ret = options.map(option => {
		const target = {
			entry: [path.join(workspace, option.input)],
			output: { path: path.join(workspace, option.path), filename: option.filename },
			module: {
				rules: [
					{ test: /\.(html|md|txt|glsl)$/, use: 'raw-loader' },
					{ test: /\.ya?ml$/, use: 'yaml-loader' },
					( env.esbuild ?
						// esbuild 构建 
						{ test: /\.(jsx?|tsx?)$/, loader: 'esbuild-loader', exclude: /(node_modules|bower_components)/, options: { loader: 'tsx' } }
						// ts-loader 构建
						: { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ }
					),
				]
			},
			plugins: [
				// 相当于 C++ 的宏定义，键名会被替换为值的字符串
				new webpack.DefinePlugin({
					PRODUCTION: JSON.stringify(env.production == true),
					BUILD_TIME: JSON.stringify(Date.now()),
					RESOURCE_VERSION: JSON.stringify(env.res || ''),
					OVERRIDE_OPTIONS: JSON.stringify(env.overrideOptions || {}),
				}),
				new webpack.ProvidePlugin({ process: 'process/browser' }),
				new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
				// ESBuild 不会自动检查TS语法，这里添加相关插件
				env.esbuild ? new (require('fork-ts-checker-webpack-plugin'))({ typescript: { mode: 'readonly' } }) : null,
			].filter(p => p != null),
			devtool: false,
			resolve: {
				extensions: ['.tsx', '.ts', '.js', 'glsl', 'md', 'txt'],
				plugins: [
					// @ts-ignore
					new (require('tsconfig-paths-webpack-plugin'))({ configFile: tsConfigFile }),
				],
				fallback: { util: require.resolve('util/') }
			},
			optimization: {
				minimize: env.minimize || env.production,
			},
			watchOptions: {
				ignored: /node_modules/,
			},
			externals: [
				{
					csharp: 'global polyfill:csharp',
					puerts: 'global polyfill:puerts',
					path: 'global polyfill:path'
				},
				option.externals,
			].filter(e => e),
		};
		target.output.library = { type: 'global', name: '$entry' };

		if (target.target === 'es2020') {
			target.experiments = { outputModule: true };
		}

		if (env.production) {
			target.mode = 'production';
			if (env.obfuscate) {
				// TODO: 拆分 obfuscate 流程以确保生成的 SourceMap 是 OK 的
				target.plugins.push(
					// @ts-ignore
					new (require('webpack-obfuscator'))({
						identifierNamesGenerator: 'mangled-shuffled',
						reservedNames: [
							'CS', 'tr', 'tiny',
							'tinyfunUnityWebGLInstance',
							'wx', 'tt', 'qg', 'ks',
							'round', 'ceil', 'sin', 'min', 'max', 'abs', 'floor', 'sqrt', 'pow', 'log', 'exp', 'tan', 'cos', 'asin', 'acos', 'atan', 'atan2', 'random',
							'foreach', 'map', 'filter'
						],
						rotateStringArray: true,
						sourceMap: true
					})
				);
			}
			// @ts-expect-error
			target.plugins.push(new webpack.SourceMapDevToolPlugin({ exclude: /node_modules/, filename: `${option.filename}.map` }));
		} else {
			target.cache = { type: 'filesystem' };
			target.mode = 'development';
			// @ts-expect-error
			target.plugins.push(new webpack.SourceMapDevToolPlugin({ exclude: /node_modules/, filename: `development/${option.filename}.map` }));
			// @ts-expect-error
			target.plugins.push(new (require('webpackbar'))());

			if (process.env.WEBPACK_SERVE) {
				target.cache = false;
				// @ts-expect-error
				target.plugins.push(new webpack.HotModuleReplacementPlugin());
				target.devServer = {
					hot: true,
					liveReload: false,
					static: '.',
					port: 3100,
					client: {
						overlay: false,
						progress: false,
						reconnect: false,
					},
					devMiddleware: {
						writeToDisk: true,
					},
				};
			}
		}
		if (env.analyze) {
			// @ts-expect-error
			target.plugins.push(new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin());
		}
		if (env.minimize === false) {
			target.optimization.minimize = false;
		}
		return target;
	});
	return ret;
};
