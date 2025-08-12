import { ReactNode } from "react"

export type Link = {
	id: string
	title: string
	description: string | null | undefined
	link: string
	type: string
	icon: ReactNode | null | undefined
}