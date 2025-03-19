import child_process from "child_process"
import pkg from "@/package.json"

export const getCommit = () => {
	let commitHash: string

	try {
		commitHash = child_process
			.execSync("git log --pretty=format:'%h' -n1")
			.toString()
			.trim()
	} catch (error) {
		commitHash = process.env.VERCEL_GIT_COMMIT_SHA
			? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)
			: "unknown"
		console.log(error)
	}
	
	return {
		name: pkg.name,
		title: pkg.title,
		year: pkg.year,
		description: pkg.description,
		version: pkg.version,
		support: pkg.support,
		repository: pkg.repository,
		license: pkg.license,
		hash: commitHash
	}
}