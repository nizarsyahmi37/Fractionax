export interface SitemapEntry {
	url: string
	lastModified: string
	changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  	priority?: number
}