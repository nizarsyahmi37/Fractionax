"use client"

import { type ReactNode } from "react"
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppKit } from "@reown/appkit/react"
// import { wagmiAdapter, solanaWeb3JsAdapter, projectId, networks } from "./config"
import { wagmiAdapter, projectId, networks } from "./config"

const queryClient = new QueryClient()

const metadata = {
	name: "Fractionax",
	description: "Own the Unreachable, Together",
	url: "https://github.com/nizarsyahmi37/Fractionax",
	icons: [
		"https://fractionax.tech/assets/brand/images/fractionax-icon.svg"
	]
}

export const modal = createAppKit({
	adapters: [
		wagmiAdapter,
		// solanaWeb3JsAdapter
	],
	projectId,
	networks,
	metadata,
	themeMode: "light",
	features: {
		analytics: true
	},
	themeVariables: {
		"--w3m-accent": "#16AF8E",
	}
})

function ContextProvider({
	children,
	cookies
}: {
	children: ReactNode
	cookies: string | null
}) {
	const initialState = cookieToInitialState(
		wagmiAdapter.wagmiConfig as Config,
		cookies
	)

	return (
		<WagmiProvider
			config={wagmiAdapter.wagmiConfig as Config}
			initialState={initialState}
		>
			<QueryClientProvider
				client={queryClient}
			>
				{children}
			</QueryClientProvider>
		</WagmiProvider>
	)
}

export default ContextProvider
