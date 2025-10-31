"use client"

import { useState } from "react"
import { Progress } from "radix-ui"
import { formatEther } from "viem"
import { general } from "@/locales/en"
import { Card } from "@/components/ui/card"
import { ButtonWithGTM } from "../../button"

import ImageDynamic from "../../image/dynamic"

export function CardMarketplaceProject() {
	const [cap, setCap] = useState<bigint>(BigInt(100000000000000000000))
	const [bought, setBought] = useState<bigint>(BigInt(0))
	const [investors, setInvestors] = useState<bigint>(BigInt(0))
	
	return (
		<Card className={`p-0 m-0 gap-0`}>
			<ImageDynamic
				title={general.title}
				className={`w-auto h-auto mb-1 rounded-t-xl`}
				light={"/demo/featured.webp"}
				dark={"/demo/featured.webp"}
				width={1500}
				height={1000}
				useWindowWidth={true}
				useWindowHeight={true}
			/>
			<div className={`px-4 mt-2`}>
				<h2 className={`text-3xl lg:text-4xl font-bold`}>
					Fractionax
				</h2>
				<p className={`mt-1 mb-2`}>
					An investment platform that unlocks fractional ownership of high-value real-world assets.
				</p>
			</div>
			<div className={`px-4 my-1`}>
				<p className={`text-sm text-center px-2 py-1 w-fit rounded-lg border-1 border-primary`}>
					Private equity
				</p>
			</div>
			<div className={`px-4`}>
				<h3 className={`font-semibold text-center text-4xl`}>
					{formatEther(cap)} <span className={`text-2xl`}>Sol</span> 
				</h3>
				<Progress.Root
					className="relative h-4 w-full overflow-hidden rounded-full bg-foreground/15"
					value={cap === BigInt(0) ? Number(bought/BigInt(1)) : Number(bought/cap)}
				>
					<Progress.Indicator
						className="h-full w-full flex-1 bg-accent rounded-full transition-all"
						style={{ transform: `translateX(-${100 - (cap === BigInt(0) ? Number(bought/BigInt(1)) : Number(bought/cap))}%)` }}
					/>
				</Progress.Root>
				<p className={`text-xs text-center`}>
					Raised {formatEther(bought)} of {formatEther(cap)} ({(cap === BigInt(0) ? Number(bought/BigInt(1)) : Number(bought/cap)).toFixed(2)}% funded)
				</p>											
			</div>
			<div className={`p-4`}>
				<ButtonWithGTM
					type={`submit`}
					eventName={`Invest in project from marketplace`}
					eventValue={`marketplaceInvest`}
					buttonTitle={`Invest Now`}
					className={`w-full bg-secondary text-secondary-foreground font-bold rounded-xl cursor-pointer px-4 py-2 duration-300 hover:scale-105`}
				/>
			</div>
		</Card>
	)
}
