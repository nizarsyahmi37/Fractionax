import type { AppKitNetwork } from "@reown/appkit/networks"
import { cookieStorage, createStorage } from "wagmi"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
// import { SolanaAdapter } from "@reown/appkit-adapter-solana/react"
// import { mainnet, arbitrum, solana, solanaDevnet, solanaTestnet } from "@reown/appkit/networks"
// import { HuobiWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { scrollSepolia } from "@reown/appkit/networks"

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || ""

if (!projectId) {
	throw new Error("Project ID is not defined")
}

export const networks = [scrollSepolia] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
	storage: createStorage({
		storage: cookieStorage
	}),
	ssr: true,
	projectId,
	networks
})

// export const solanaWeb3JsAdapter = new SolanaAdapter({
// 	wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
// })

export const config = wagmiAdapter.wagmiConfig