import { globby } from "globby"
import { MetadataRoute } from "next"
import { SitemapEntry } from "@/lib/interface/sitemap"

function addPage(page: string): string {
	let path = page
		.replace(/^app/, "")
		.replace(/\.(js|jsx|ts|tsx|mdx)$/, "")
		.replace(/\/page$/, "")

  	path = path.replace(/\/\([^)]+\)/g, "")

	return path || "/"
}

function getChangeFrequency(route: string): SitemapEntry["changeFrequency"] {
	if (route === "/")
		return "daily"
	
	if (route.includes("/blog/"))
		return "weekly"
	
	if (route.includes("/docs/"))
		return "monthly"

	return "weekly"
}

function getPriority(route: string): number {
	if (route === "/")
		return 1.0
	
	if (route.includes("/blog/"))
		return 0.8
	
	if (route.includes("/docs/"))
		return 0.7

	return 0.6
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	try {
		const pages: string[] = await globby([
			"app/**/page.{js,jsx,ts,tsx,mdx}",
			"!app/**/layout.{js,jsx,ts,tsx}",
			"!app/**/default.{js,jsx,ts,tsx}",
			"!app/**/loading.{js,jsx,ts,tsx}",
			"!app/**/error.{js,jsx,ts,tsx}",
			"!app/**/global-error.{js,jsx,ts,tsx}",
			"!app/**/not-found.{js,jsx,ts,tsx}",
			"!app/api/**/*",
			"!app/_*/**/*"
		])

		const baseUrl = process.env.WEBSITE_URL
		
		if (!baseUrl) {
			console.error("❌ Website URL not found in environment variables")
			return []
		}
		
		const routes: MetadataRoute.Sitemap = pages.map((page: string) => {
			const route = addPage(page)
			
			return {
				url: `${baseUrl}${route}`,
				lastModified: new Date().toISOString(),
				changeFrequency: getChangeFrequency(route),
				priority: getPriority(route),
			}
		})
		
		// Add any additional static routes
		const staticRoutes: MetadataRoute.Sitemap = [
		// Add any routes that aren"t file-based
		// {
		//   url: `${baseUrl}/special-page`,
		//   lastModified: new Date().toISOString(),
		//   changeFrequency: "monthly",
		//   priority: 0.8,
		// },
		]
		
		return [...routes, ...staticRoutes]
		
	} catch (error) {
		console.error("❌ Error generating sitemap:", error)
		return []
	}
}
