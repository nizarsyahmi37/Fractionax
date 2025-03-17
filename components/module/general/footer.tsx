import { terms } from "@/content/general/general"
import { getCommit } from "@/lib/versions"

export default async function Footer() {
	const { year, title, version, hash} = getCommit()

	return (
		<footer className={`text-center p-4`}>
			<p className={``}>
				{`© ${year} — ${title} | ${terms.rights_reserved}`} <span className={`text-xs font-bold`}>
					{`v.${version}.${hash}`}
				</span>
			</p>
		</footer>
	)
}
