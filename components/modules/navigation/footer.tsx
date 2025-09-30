"use client"

// import { useRouter } from "next/navigation"
import { terms } from "@/locales/en"
import { Link } from "@/types/general"

export function NavigationFooter({
	title,
	data,
	className,
	titleClass,
	navClass
} : {
	title: any
	data: Link[]
	className?: string
	titleClass?: string
	navClass?: string
}) {
	// const router = useRouter()

	return (
		<div className={className}>
			<h3 className={`${titleClass} text-accent-foreground font-bold`}>
				{title}
			</h3>
			<ul>
				{data.map((item) => (
					<li
						key={item.id}
						title={item.description ? item.description : terms.coming_soon}
						className={`${navClass} ${!item.description ? `text-foreground/30 cursor-not-allowed` : `text-foreground/75 cursor-pointer hover:text-secondary`}`}
					>
						{item.title}
					</li>
				))}
			</ul>
		</div>
	)
}
