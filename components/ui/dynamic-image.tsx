"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import Image from "next/image"

export default function ImageDynamic({
	title,
	className,
	light,
	dark,
	width,
	height,
	useWindowWidth,
	useWindowHeight,
	onClick
}: {
	title: string
	className: string
	light: string
	dark: string
	width: number
	height: number
	useWindowWidth: boolean
	useWindowHeight: boolean
	onClick?: VoidFunction
}) {
	const { theme, resolvedTheme } = useTheme()
	const [domLoaded, setDomLoaded] = useState(false)

	const [dimensions, setDimensions] = useState({ w: width, h: height })

	useEffect(() => {
		setDomLoaded(true)
		if (useWindowWidth || useWindowHeight) {
			const updateDimensions = () => {
				setDimensions({
					w: useWindowWidth ? window.innerWidth : width,
					h: useWindowHeight ? window.innerHeight : height,
				})
			}
			updateDimensions()
			window.addEventListener("resize", updateDimensions)
			return () => window.removeEventListener("resize", updateDimensions)
		}
	}, [useWindowWidth, useWindowHeight, width, height])

	return (
		<div onClick={onClick}>
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
