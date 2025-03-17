"use client"

import { ChevronLeft } from "lucide-react"
import { Progress } from "radix-ui"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { InferSelectModel } from "drizzle-orm"
import { investment } from "@/db/schema"
// import { useEdgeStore } from "@/lib/edgestore"
import ImageDynamic from "@/components/ui/dynamic-image"

export default function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const router = useRouter()
	const [info, setInfo] = useState<InferSelectModel<typeof investment>>()
	
	useEffect(() => {
		const fetchInvestment = async () => {
			try {
				const response = await fetch(`/api/investments?id=${(await params).id}`)
				const data = await response.json()
				setInfo(data.data.result[0])
			} catch (error) {
				console.error("Error fetching data:", error)
			}
		}
		fetchInvestment()
	}, [params])
	
	// const [file, setFile] = useState<File>()
	// const { edgestore } = useEdgeStore()
  
	return (
		<div>
			{/* <div>
				<input
					type="file"
					onChange={(e) => {
						setFile(e.target.files?.[0])
					}}
				/>
				<button
					onClick={async () => {
						if (file) {
							const res = await edgestore.publicFiles.upload({
								file,
								onProgressChange: (progress) => {
									console.log(progress)
								}
							})
							console.log(res)
						}
					}}
				>
					Upload
				</button>
			</div> */}

			<div className={`max-w-[1500px] w-full mx-auto grid grid-cols-1 gap-8 grid-rows-[auto_1fr]`}>
				{info ? (
					<div>
						<div className={`cursor-pointer flex gap-4 items-center`} onClick={() => router.push("/listing")}>
							<ChevronLeft /> Back to listings
						</div>
						<div className={`grid grid-cols-[2fr_1fr] gap-8 min-h-[450px] my-8 items-center`}>
							<ImageDynamic
								title={`${info?.title}`}
								className={`grid w-full border rounded-xl`}
								light={info?.images ? info?.images[0] : ""}
								dark={info?.images ? info?.images[0] : ""}
								width={1920}
								height={1920}
								useWindowWidth={false}
								useWindowHeight={false}
							/>
							<div className={`grid gap-8 h-full`}>
								{info?.images && info?.images.map((lst, i) => (
									i > 0 && <ImageDynamic
										title={`${info?.title}`}
										className={`grid w-full border rounded-xl`}
										light={lst}
										dark={lst}
										width={1920}
										height={1920}
										useWindowWidth={false}
										useWindowHeight={false}
										key={i}
									/>
								))}
							</div>
						</div>
						<div className={`grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12`}>
							<div className={`grid gap-8 h-fit`}>
								<div className={`grid gap-2 items-center`}>
									<h2 className={`font-bold text-4xl`}>
										{info?.title}
									</h2>
									<h3 className={``}>
										{info?.location && `${info?.location},`} {info?.country} | <span className={`rounded-xl border border-accent text-xs px-2 py-1`}>{info?.category}</span>
									</h3>
								</div>
								<div className={`border border-foreground/15`} />
								<div className={`grid gap-2`}>
									<h3 className={`font-bold text-4xl`}>
										Overview
									</h3>
									<div className={`grid gap-2`} style={{ whiteSpace: "pre-line" }}>
										{info?.content.replace(/\\n/g, "\n")}
									</div>
									<br />
									<h3 className={`font-bold text-4xl`}>
										Keywords
									</h3>
									<div className={`inline-flex gap-1`}>
										{info?.keywords?.map((k, i) => (
											<p key={i} className={`flex`}>
												{k} {(info?.keywords && i < info?.keywords?.length - 1) && " | "}
											</p>
										))}
									</div>
								</div>
							</div>
							<div className={`grid gap-2`}>
								<div className={`h-fit border border-accent rounded-xl p-8 grid gap-2`}>
									<h3 className={`font-semibold text-center text-4xl`}>
										{/* <span className={`text-2xl`}>{list?.currency}</span> {list?.price} */}
									</h3>
									<Progress.Root
										className="relative h-4 w-full overflow-hidden rounded-full bg-foreground/15"
										value={30}
									>
										<Progress.Indicator
											className="h-full w-full flex-1 bg-accent rounded-full transition-all"
											style={{ transform: `translateX(-${100 - 30}%)` }}
										/>
									</Progress.Root>
									<p className={`text-xs text-center`}>
										{/* Raised 171000 of {list?.price} (30% funded) */}
									</p>
									<div className={`my-2 border border-foreground/15`} />
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											No. of investors
										</p>
										<p className={`text-right font-bold`}>
											60
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Min. investment
										</p>
										<p className={`text-right font-bold`}>
											{/* {list?.currency} {list?.minimum} */}
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Max. investment
										</p>
										<p className={`text-right font-bold`}>
											{/* {list?.currency} {list?.price} */}
										</p>
									</div>
									<div className={`my-2 border border-foreground/15`} />
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Investment Structure
										</p>
										<p className={`text-right font-bold`}>
											{info?.structure}
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Token claim
										</p>
										<p className={`text-right font-bold`}>
											{info?.claim}
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Dividend yield
										</p>
										<p className={`text-right font-bold`}>
											{info?.yields}
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Investment period
										</p>
										<p className={`text-right font-bold`}>
											{info?.period}
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Distribution Frequency
										</p>
										<p className={`text-right font-bold`}>
											{info?.frequency}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className={`text-center grid gap-4 items-center`}>
						<p className={`cursor-pointer flex gap-4 mx-auto border border-accent pl-2 py-2 pr-4 rounded-2xl hover:scale-105`} onClick={() => router.push("/listing")}>
							<ChevronLeft /> Back to listings
						</p>
						<p>
							The id provided for the investment listing is invalid.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
