import { terms } from "@/content/general/general"

export default async function Footer({
	year,
	title,
	version,
	hash
} : {
	year: string
	title: string
	version: string
	hash: string
}) {
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
