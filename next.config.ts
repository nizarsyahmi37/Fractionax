import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	webpack: config => {
		config.externals.push(
			"pino-pretty",
			"lokijs",
			"encoding"
		)
		return config
	}
	/* config options here */
	// images: {
	// 	remotePatterns: [
	// 		{
	// 			protocol: 'https',
	// 			hostname: 's3.amazonaws.com',
	// 			port: '',
	// 			pathname: '/my-bucket/**',
	// 			search: '',
	// 		},
	// 	],
	// }
}

export default nextConfig
