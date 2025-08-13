import { ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

import Header from "./header"
import Footer from "./footer"

export default async function Layout({
	children
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<div
			className={`grid grid-rows-[auto_1fr] w-full h-[100vh] min-w-[100vw] min-h-[100vh] max-w-[100vw] max-h-[100vh]`}
		>
			<Header />
			<ScrollArea className={`grid grid-rows-[auto_1fr] w-full h-auto overflow-auto`}>
				<main className={`min-h-[50vh] p-4 lg:p-8`}>
					{children}
				</main>
				<Footer />
			</ScrollArea>
		</div>
	)
}
