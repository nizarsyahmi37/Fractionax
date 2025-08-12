"use client"

import { sendGTMEvent } from "@next/third-parties/google"

export function Button({
	eventName = "buttonClicked",
	eventValue = "xyz",
	buttonTitle = "Send event",
	className,
	id,
	type = "button"
} : {
	eventName: string
	eventValue: string
	buttonTitle: any
	className?: string
	id?: string
	type?: "submit" | "reset" | "button" | undefined
}) {
	return (
		<button
			id={id}
			type={type}
			className={className}
			onClick={() => sendGTMEvent({
				event: eventName,
				value: eventValue
			})}
		>
			{buttonTitle}
		</button>
	)
}
