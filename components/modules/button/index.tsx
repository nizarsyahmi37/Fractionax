"use client"

import { Button } from "@/components/ui/button"
import { sendGTMEvent } from "@next/third-parties/google"

export function ButtonWithGTM({
	eventName = "buttonClicked",
	eventValue = "xyz",
	buttonTitle = "Send event",
	className,
	id,
	type = "button",
	onClick
} : {
	eventName: string
	eventValue: string
	buttonTitle: any
	className?: string
	id?: string
	type?: "submit" | "reset" | "button" | undefined
	onClick?: () => void
}) {
	const handleClick = () => {
		onClick && onClick()
		sendGTMEvent({
			event: eventName,
			value: eventValue
		})
	}
	return (
		<Button
			id={id}
			type={type}
			className={className}
			onClick={handleClick}
		>
			{buttonTitle}
		</Button>
	)
}
