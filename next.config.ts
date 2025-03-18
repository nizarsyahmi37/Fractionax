import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	// images: {
	// 	remotePatterns: [
	// 		{
	// 			protocol: 'https',
	// 			hostname: 'files.edgestore.dev',
	// 		}
	// 	]
	// },	
	webpack: config => {
		config.externals.push(
			"pino-pretty",
			"lokijs",
			"encoding"
		)
		return config
	}
}

export default nextConfig
