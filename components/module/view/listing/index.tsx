"use client"

import { ChevronDown, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { InferSelectModel } from "drizzle-orm"
import { investment } from "@/db/schema"
import { truncateText } from "@/lib/utils"

import ImageDynamic from "@/components/ui/dynamic-image"

export default function ViewListing() {
	const router = useRouter()
	const [info, setInfo] = useState<InferSelectModel<typeof investment>[]>()
	
	useEffect(() => {
		const fetchInvestment = async () => {
			try {
				const response = await fetch(`/api/investments`)
				const data = await response.json()
				setInfo(data.data.result)
			} catch (error) {
				console.error("Error fetching data:", error)
			}
		}
		fetchInvestment()
	}, [])

	return (
		<div
			className={`min-h-[100vh] items-center p-8`}
		>
			<div className={`max-w-[1500px] w-full mx-auto grid grid-cols-1 gap-8`}>
				<div className={`grid gap-2 my-16 items-center text-center`}>
					<h2 className={`font-bold text-4xl`}>
						Listings
					</h2>
					<h3 className={``}>
						Invest in all kind of assets and opportunities
					</h3>
				</div>
				<div className={`grid grid-cols-1 gap-8 p-2`}>
					<div className={`grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-4`}>
						<div className={`w-full`}>
							<div className={`flex gap-2 py-2 rounded-xl items-center content-center w-full lg:w-fit font-bold`}>
								<div className={`rounded-xl flex gap-4 border border-accent px-4 py-2 items-center`}>
									<div className={`grid`}>
										<span className={`text-xs font-normal`}>
											Location
										</span>
										Worldwide
									</div> <ChevronDown />
								</div>
								<div className={`rounded-xl flex gap-4 border border-accent px-4 py-2 items-center`}>
									<div className={`grid`}>
										<span className={`text-xs font-normal`}>
											Type
										</span>
										All
									</div> <ChevronDown />
								</div>
								<div className={`rounded-xl flex gap-4 border border-accent px-4 py-2 items-center min-w-[300px] w-full`}>
									<div className={`grid w-full`}>
										<span className={`text-xs font-normal`}>
											Search
										</span>
										<span className={`opacity-30`}>
											Search for your asset 
										</span>
									</div> <Search />
								</div>
							</div>
						</div>
						<div className={`w-full`}>
							<div className={`flex gap-2 p-2 border border-accent rounded-xl items-center content-center justify-center font-bold`}>
								<div className={`bg-accent rounded-xl text-background px-4 py-2`}>
									Available
								</div>
								<div className={`rounded-xl px-4 py-2`}>
									Funded
								</div>
								<div className={`rounded-xl px-4 py-2`}>
									Exited
								</div>
							</div>
						</div>
					</div>
					<div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8`}>
						{/* <div className={`cursor-pointer border border-accent group rounded-xl hover:scale-105 w-full h-full items-center content-center`}>
							<div className="w-fit h-fit mx-auto my-auto">
								<PlusCircleIcon className={`mx-auto w-15 h-15 p-2 text-accent group-hover:text-secondary`} />
								List your project
							</div>
						</div> */}
						{info?.map((itm) => (
							<div key={itm.id} className={`border border-accent rounded-xl hover:scale-105`}>
								<ImageDynamic
									title={itm.title}
									className={`grid w-full rounded-xl`}
									light={itm.images ? itm.images[0] : ""}
									dark={itm.images ? itm.images[0] : ""}
									width={1920}
									height={1920}
									useWindowWidth={false}
									useWindowHeight={false}
								/>
								<div className={`grid gap-4 p-4`}>
									<p className={`font-bold text-xl`}>
										{truncateText(itm.title)}
										<br />
										<span className={`rounded-xl border border-accent text-xs px-2 py-1 w-fit`}>
											{itm.category}
										</span>
									</p>
									<div className={`my-2 border border-foreground/15`} />
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Investment Structure
										</p>
										<p className={`text-right font-bold`}>
											{itm.structure}
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Token Claim
										</p>
										<p className={`text-right font-bold`}>
											{itm.claim}
										</p>
									</div>
									<div onClick={() => router.push(`/listing/${itm.id}`)} className={`border border-accent rounded-xl p-2 text-center cursor-pointer font-bold hover:bg-accent hover:text-white`}>
										Learn more
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
