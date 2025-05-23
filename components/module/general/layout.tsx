import { ReactNode } from "react"

import Header from "./header"
import Footer from "./footer"
import { AlertTriangle } from "lucide-react"

export default async function Layout({
	children,
	year,
	title,
	version,
	hash
}: Readonly<{
	children: ReactNode
	year: string
	title: string
	version: string
	hash: string
}>) {  
	return (
		<div>
			<div className={`bg-red-700 text-white font-bold text-center p-2`}>
				<div className={`flex gap-2 mx-auto w-fit`}>
					<AlertTriangle /> This platform is only open for testing on Scroll Sepolia.
				</div>
			</div>
			<Header />
			<main
				className={`min-h-[100vh] items-center content-center p-8`}
			>
				{children}
			</main>
			<Footer year={year} title={title} version={version} hash={hash} />
		</div>
	)
}
