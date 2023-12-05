const { config } = require('process')

/** @type {import('next').NextConfig} */
const nextConfig = {}

nextConfig.webpack = (config, _) => {
	config.module.rules.push({
		test: /\.(png|jpg|gif|mp3|wav)$/,
		type: 'asset/resource',
	})

	return config
}

module.exports = nextConfig
