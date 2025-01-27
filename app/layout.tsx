import type { Metadata } from "next"
import { ReactNode } from "react"

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
		<html lang="en">
			<body
				className={`antialiased`}
			>
				{children}
			</body>
		</html>
	)
}
