import type { Metadata } from "next"
import { headers } from "next/headers"
import { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"

import ContextProvider from "@/components/module/reown/context"

import "./globals.css"

export const metadata: Metadata = {
	title: "Fractionax",
	description: "Own the Unreachable, Together"
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	const headersObj = await headers();
	const cookies = headersObj.get('cookie')
  
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
					<ContextProvider cookies={cookies}>
						{children}
					</ContextProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
