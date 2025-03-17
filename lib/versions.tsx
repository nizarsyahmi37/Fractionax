import child_process from "child_process"
import pkg from "@/package.json"

export const getCommit = () => {
	const commitHash: string = child_process
		.execSync("git log --pretty=format:'%h' -n1")
		.toString()
		.trim()

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