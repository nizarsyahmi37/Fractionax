"use client"

import { truncateAddress } from "@/lib/utils"
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitState } from "@reown/appkit/react"
import { Loader } from "lucide-react"
import { formatEther, getAddress } from "viem"
import { useBalance } from "wagmi"

export default function ButtonConnect() {
    const { isConnected, address } = useAppKitAccount()
    const { open } = useAppKit()
    const state = useAppKitState()
    const { caipNetwork } = useAppKitNetwork()

    const result = useBalance({
        address: getAddress(address || "0x0000000000000000000000000000000000000000")
    })    

    return (
        <button type={`button`} onClick={() => open()} className={`${state.open && "bg-accent text-background"} group border border-accent rounded-xl text-center cursor-pointer font-bold hover:bg-accent hover:border-none hover:text-white`}>
            {state.loading ? (
                <div className={`px-4 py-2`}>
                    Loading...
                </div>
            ) : (
                !state.initialized ? (
                    <div className={`px-4 py-2`}>
                        Initializing...
                </div>
                ) : (
                    state.open ? (
                        <div className={`flex gap-2 px-4 py-2`}>
                            <Loader className={`animate-spin duration-100`} /> Connecting...
                        </div>
                    ) : (
                        isConnected ? (
                            <div className={`grid grid-cols-1 lg:grid-cols-[1fr_auto]`}>
                                <div className={`px-4 py-2`}>
                                    {truncateAddress(address || "0x0000000000000000000000000000000000000000", 4, -6)}
                                </div>
                                <div className={`bg-accent px-4 py-2 rounded-lg border-transparent border text-background group-hover:border-background`}>
                                    {Number(formatEther(result.data ? result.data?.value : BigInt(0))).toFixed(4)} {caipNetwork?.nativeCurrency.symbol}
                                </div>
                            </div>
                        ) : (
                            !isConnected ? (
                                <div className={`px-4 py-2`}>
                                    Connect Wallet
                                </div>
                            ) : (
                                <div className={`px-4 py-2`}>
                                    Loading..
                                </div>
                            )
                        )
                    )
                )
            )}
        </button>
    )
}
