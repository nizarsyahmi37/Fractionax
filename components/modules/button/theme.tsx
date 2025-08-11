"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function ButtonTheme() {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [domLoaded, setDomLoaded] = useState(false)

	useEffect(() => {
		setDomLoaded(true)
	}, [])

	return (
		<div>
			{domLoaded && (
				theme == "dark" ? (
					<button type="button" name="Turn Light Mode" className="cursor-pointer flex items-center gap-1 group hover:bg-primary hover:text-primary-foreground bg-background border-2 border-primary p-2 lg:p-4 rounded-2xl font-bold" onClick={() => setTheme("light")}>
						<Sun className="group-hover:-rotate-12 group-hover:animate-pulse group-hover:scale-150 scale-90 duration-150 ease-in" />
					</button>
				) : (
					theme == "light" ? (
						<button type="button" name="Turn Dark Mode" className="cursor-pointer flex items-center gap-1 group hover:bg-primary hover:text-primary-foreground bg-background border-2 border-primary p-2 lg:p-4 rounded-2xl font-bold" onClick={() => setTheme("dark")}>
							<Moon className="group-hover:-rotate-12 group-hover:animate-pulse group-hover:scale-150 scale-90 duration-150 ease-in" />
						</button>
					) : (
						resolvedTheme ? (
							<button type="button" name={resolvedTheme == "dark" ? "Turn Light Mode" : "Turn Dark Mode"} className="cursor-pointer flex items-center gap-1 group hover:bg-primary hover:text-primary-foreground bg-background border-2 border-primary p-2 lg:p-4 rounded-2xl font-bold" onClick={() => resolvedTheme == "dark" ? setTheme("light") : setTheme("dark")}>
								{resolvedTheme == "dark" ? (
									<Sun className="group-hover:-rotate-12 group-hover:animate-pulse group-hover:scale-150 scale-90 duration-150 ease-in" />
								) : (
									<Moon className="group-hover:-rotate-12 group-hover:animate-pulse group-hover:scale-150 scale-90 duration-150 ease-in" />
								)}
							</button>
						) : null
					)
				)
			)}
		</div>
	)
}