import { ReactNode } from "react"

export function CardInfo({
	title,
	description,
	button,
	image,
	className,
	titleClass,
	descriptionClass
} : {
	title: ReactNode
	description?: ReactNode
	button?: ReactNode
	image?: ReactNode
	className?: string
	titleClass?: string
	descriptionClass?: string
}) {
	return (
		<div className={`${className} grid gap-4 hover:scale-105 border-foreground/60 hover:border-primary border-2 bg-gradient-to-br from-50% from-background via-75% via-foreground/10 hover:via-primary/10 to-background to-100% rounded-2xl`}>
			{image}
			<div>
				<h4 className={`${titleClass} font-bold`}>
					{title}
				</h4>
				<p className={`${descriptionClass}`}>
					{description}
				</p>
				{button}
			</div>
		</div>
	)
}
