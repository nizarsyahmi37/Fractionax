import type { Metadata } from "next"
import { headers } from "next/headers"
import { ReactNode } from "react"
import { GoogleTagManager } from "@next/third-parties/google"
import { ThemeProvider } from "@/components/modules/general/theme"
import { inter } from "@/lib/font"

import ContextProvider from "@/components/modules/reown/context"
import Layout from "@/components/modules/general/layout"

import "./globals.css"

export const metadata: Metadata = {
	title: {
		template: "%s | Fractionax",
		default: "Fractionax"
	},
	description: "Own the Unreachable, Together",
	generator: "Next.js",
	applicationName: "Fractionax",
	keywords: [
		"fractionax",
		"fractionalized assets",
		"assets exchange",
		"decentralized",
		"application",
		"dapp",
		"nizarsyahmi37"
	],
	authors: [
		{
			name: "Nizar Syahmi bin Nazlan",
			url: "https://nizarsyahmi37.com"
		}
	],
	creator: "Nizar Syahmi bin Nazlan",
	publisher: "Nizar Syahmi bin Nazlan",
	formatDetection: {
		date: true,
		email: true,
		address: true,
		telephone: true,
		url: true
	},
	metadataBase: new URL("https://www.fractionax.app"),
	alternates: {
		canonical: "/",
		languages: {
			"en-US": "/en-US"
		}
	},
	openGraph: {
		title: "Fractionax",
		description: "Own the Unreachable, Together",
		siteName: "Fractionax",
		url: "https://www.fractionax.app",
		images: [
			{
				url: "https://www.fractionax.app/og.png",
				alt: "Fractionax | Own the Unreachable, Together"
			}
		],
		locale: "en_US",
		alternateLocale: [],
		type: "website"
	},
	robots: {
		index: true,
		follow: true,
		indexifembedded: true,
		nocache: false,
		nosnippet: false,
		notranslate: false,
		nositelinkssearchbox: false,
		noimageindex: false,
		googleBot: {
			index: true,
			follow: true,
			indexifembedded: true,
			nocache: false,
			nosnippet: false,
			notranslate: false,
			nositelinkssearchbox: false,
			noimageindex: false,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1
		}
	},
	twitter: {
		card: "summary_large_image",
		title: "Fractionax",
		description: "Own the Unreachable, Together",
		site: "@fractionaxapp",
		siteId: "",
		creator: "@nizarsyahmi37",
		creatorId: "870860500707430400",
		images: {
			url: "https://www.fractionax.app/og.png",
			alt: "Fractionax | Own the Unreachable, Together"
		}
	},
	icons: {
		icon: [
			new URL("/favicon.ico", "https://www.fractionax.app"),
			{
				url: "/favicon.ico"
			},
			{
				url: "/icon-light.png",
				media: "(prefers-color-scheme: dark)"
			},
			{
				url: "/icon-dark.png",
				media: "(prefers-color-scheme: light)"
			}
		],
		shortcut: [
			"/shortcut-icon.png"
		],
		apple: [
			{
				url: "/apple-touch-icon.png",
				type: "image/png"
			}
		]
	},
	manifest: "https://www.fractionax.app/manifest.json"
}

export default async function RootLayout({
	children
}: Readonly<{
	children: ReactNode
}>) {
	const headersData = await headers()
	const cookies = headersData.get("cookie")

	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body
				className={`${inter.className} antialiased`}
			>
				<GoogleTagManager
					gtmId={process.env.GOOGLE_TAG_MANAGER_ID as string}
				/>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<ContextProvider cookies={cookies}>
						<Layout>
							{children}
						</Layout>
					</ContextProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
