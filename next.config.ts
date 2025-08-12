import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	webpack: config => {
		config.externals.push(
			"pino-pretty",
			"lokijs",
			"encoding"
		)
		return config
	},
	turbopack: {
		resolveExtensions: ["md", ".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
	},

	/* config options here */
	// images: {
	// 	remotePatterns: [
	// 		{
	// 			protocol: "https",
	// 			hostname: "s3.amazonaws.com",
	// 			port: "",
	// 			pathname: "/my-bucket/**",
	// 			search: "",
	// 		},
	// 	],
	// }
}

export default nextConfig
