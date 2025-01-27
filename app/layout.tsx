import type { Metadata } from "next"
import { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
	title: "Fractionax",
	description: "Own the Unreachable, Together"
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
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
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
