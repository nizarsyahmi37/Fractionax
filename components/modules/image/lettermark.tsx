"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import Image from "next/image"

export default function ImageLettermark({
	title,
	lightImg,
	darkImg
}: {
	title: string
	lightImg?: string
	darkImg?: string
}) {
	const { theme, resolvedTheme } = useTheme()
	const [domLoaded, setDomLoaded] = useState(false)
	const [dimensions, setDimensions] = useState({ w: 0, h: 0 })
	const dark = lightImg ? lightImg : "/brand/assets/lettermark/dark.svg"
	const light = darkImg ? darkImg : "/brand/assets/lettermark/light.svg"
	const className = "w-auto h-auto -mt-[0.15rem] lg:-mt-[0.6rem]"

	useEffect(() => {
		setDomLoaded(true)
		const updateDimensions = () => {
			setDimensions({
				w: window.innerWidth,
				h: window.innerHeight
			})
		}
		updateDimensions()
		window.addEventListener("resize", updateDimensions)
		return () => window.removeEventListener("resize", updateDimensions)
	}, [])

	return (
		<div>
			{domLoaded && (
				theme == "dark" ? (
					<Image style={{ width: "auto", height: "auto" }} width={dimensions.w} height={dimensions.h} className={className} alt={title} src={dark} />
				) : (
					theme == "light" ? (
						<Image style={{ width: "auto", height: "auto" }} width={dimensions.w} height={dimensions.h} className={className} alt={title} src={light} />
					) : (
						resolvedTheme ? (
							<Image style={{ width: "auto", height: "auto" }} width={dimensions.w} height={dimensions.h} className={className} alt={title} src={resolvedTheme == "dark" ? dark : light} />
						) : null
					)
				)
			)}
		</div>
	)
}