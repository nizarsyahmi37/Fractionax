"use client"

import type { Metadata } from "next"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"

import ContextProvider from "@/components/module/reown/context"

import "./globals.css"

export const metadata: Metadata = {
	title: "Fractionax",
	description: "Own the Unreachable, Together"
}

export default async function GlobalError({
	error,
	reset
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {  
	const router = useRouter()

	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<html lang="en" suppressHydrationWarning>
        	<head />
        	<body
				className={`antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					// enableSystem
					disableTransitionOnChange
				>
					<ContextProvider cookies={null}>
						<div>
							<h2>
								Something went wrong!
							</h2>
							<button
								onClick={() => reset()}
							>
								Try again
							</button>
							<button
								onClick={() => router.push("/")}
							>
								Return Home
							</button>
						</div>
					</ContextProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
