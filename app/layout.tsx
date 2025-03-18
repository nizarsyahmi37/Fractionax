import type { Metadata } from "next"
import { headers } from "next/headers"
import { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { EdgeStoreProvider } from "@/lib/edgestore"

import ContextProvider from "@/components/module/reown/context"
import Layout from "@/components/module/general/layout"

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
					defaultTheme="light"
					// enableSystem
					disableTransitionOnChange
				>
					<EdgeStoreProvider>
						<ContextProvider cookies={cookies}>
							<Layout>
								{children}
							</Layout>
						</ContextProvider>
					</EdgeStoreProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
