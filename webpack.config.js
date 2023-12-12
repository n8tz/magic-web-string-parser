/*
 
 * Copyright (c) 
 *  @author : Nathanael Braun
 *  @contact : n8tz.js@gmail.com
 */
const lPack = require('layer-pack');

lPack.loadConfig(
	{
		"default": {
			"rootFolder": "lib",
			
			vars: {
				externals   : true, // directly use lpack to exclude code outside
				"rootAlias": "Lib"
			},
		}
	}
)

const isExcluded = lPack.isFileExcluded("default");

module.exports = [
	{
		mode: "production",
		
		// The jsx App entry point
		entry: {
			"Lib": ["./lib/index.js"]
		},
		
		// The resulting build
		output: {
			path         : __dirname + "/dist",
			filename     : "mwsp.js",
			publicPath   : "/",
			libraryTarget: "commonjs-module"
		},
		
		// add sourcemap in a dedicated file (.map)
		devtool: false,
		
		// required files resolving options
		resolve: {
			extensions: [
				".",
				".js",
				".jsx",
				".json",
				".scss",
				".css",
			],
			alias     : {},
		},
		
		// Global build plugin & option
		plugins: [
			lPack.plugin("default"),
		],
		
		
		// the requirable files and what manage theirs parsing
		module: {
			rules: [
				{
					test   : /\.jsx?$/,
					exclude: isExcluded,
					use    : [
						{
							loader : 'babel-loader',
							options: {
								cacheDirectory: true, //important for performance
								presets       : [
									['@babel/preset-env'],
								],
								plugins       : []
							}
						},
					]
				},
			],
		},
	},
]
