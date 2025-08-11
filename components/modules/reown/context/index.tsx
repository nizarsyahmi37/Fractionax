"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppKit } from "@reown/appkit/react"
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"
import React, { type ReactNode } from "react"
import { wagmiAdapter, solanaWeb3JsAdapter, projectId, networks } from "../config"

// Set up queryClient
const queryClient = new QueryClient()

// Set up metadata
const metadata = {
	name: "fractionax",
	description: "Own the Unreachable, Together",
	url: "https://www.fractionax.app",
	icons: ["https://www.fractionax.app/favicon.ico"]
}

// Create the modal
export const modal = createAppKit({
	adapters: [
		wagmiAdapter,
		solanaWeb3JsAdapter
	],
	projectId,
	networks,
	metadata,
	themeMode: "dark",
	features: {
		emailShowWallets: false,
		analytics: true // Optional - defaults to your Cloud configuration
	},
	themeVariables: {
		"--w3m-accent": "#000000"
	}
})

function ContextProvider({
	children,
	cookies
}: {
	children: ReactNode
	cookies: string | null
}) {
	const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

	return (
		<WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</WagmiProvider>
	)
}

export default ContextProvider
