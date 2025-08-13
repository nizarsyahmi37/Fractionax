"use client"

import { useRouter } from "next/navigation"
import { general } from "@/locales/en"

import ImageDynamic from "../image/dynamic"

export default function ButtonLogo() {
	const router = useRouter()

	return (
		<ImageDynamic
			title={general.title}
			className={`w-auto h-auto cursor-pointer mb-1 max-h-[3rem] duration-300 hover:scale-105`}
			light={"/brand/assets/lettermark/primary.svg"}
			dark={"/brand/assets/lettermark/primary.svg"}
			width={221.59}
			height={48}
			useWindowWidth={true}
			useWindowHeight={true}
			onClick={() => router.push("/")}
		/>
	)
}