"use client"

import { sendGTMEvent } from "@next/third-parties/google"

export function Button({
	eventName = "buttonClicked",
	eventValue = "xyz",
	buttonTitle = "Send event",
	className,
	id
} : {
	eventName: string
	eventValue: string
	buttonTitle: any
	className?: string
	id?: string
}) {
	return (
		<button
			id={id}
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
