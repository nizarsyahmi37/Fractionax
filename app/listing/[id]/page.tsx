"use client"

import { ChevronLeft } from "lucide-react"
import { Progress } from "radix-ui"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { InferSelectModel } from "drizzle-orm"
import { investment, user } from "@/db/schema"
import { createPublicClient, formatEther, getAddress, http, isAddress, parseEther } from "viem"
import { coreTestnet2 } from "viem/chains"
// import { useEdgeStore } from "@/lib/edgestore"
import { wagmiAbi } from "@/abi"
import { isValidEmail, truncateAddress } from "@/lib/utils"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppKitAccount } from "@reown/appkit/react"
import { useWriteContract } from "wagmi"
import ImageDynamic from "@/components/modules/image/dynamic"


export default function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const router = useRouter()
	const [info, setInfo] = useState<InferSelectModel<typeof investment>>()
	const [usr, setUsr] = useState<InferSelectModel<typeof user>>()
	const [projectId, setProjectId] = useState<number>(0)
	const [cap, setCap] = useState<bigint>(BigInt(0))
	const [bought, setBought] = useState<bigint>(BigInt(0))
	const [investors, setInvestors] = useState<bigint>(BigInt(0))
	const [token, setToken] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000")
	const [evm, setEvm] = useState<string>("")
	const [email, setEmail] = useState<string>("")
	const [amount, setAmount] = useState<number>(0)
	
	const account = useAppKitAccount()
	
	const { writeContract, isSuccess } = useWriteContract()

	async function submitInterest() {
		const response = await fetch("/api/interests", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				email: email,
				evmWallet: evm,
				interestId: projectId
			})
		})
		const data = await response.json()
		console.log(data)
		alert(`Interest submitted to use ${evm} for this investment.`)
	}
	
	async function buyToken() {
		writeContract({
			address: '0x35B55F36A88240BAbC35F9681163c57608D34CeD',
			abi: wagmiAbi,
			functionName: 'buy',
			args: [
				parseEther(amount.toString())
			],
			account: getAddress(account.address ? account.address?.toString() : "0x0000000000000000000000000000000000000000"),
			value: parseEther((amount * 0.02).toString())
		})

		// const { request } = await createPublicClient({
		// 	chain: coreTestnet2,
		// 	transport: http()
		//   }).simulateContract({
		// 	address: '0x35B55F36A88240BAbC35F9681163c57608D34CeD',
		// 	abi: wagmiAbi,
		// 	functionName: 'buy',
		// 	args: [
				
		// 	],
		// 	account: getAddress(account.address ? account.address?.toString() : "0x0000000000000000000000000000000000000000"),
		// 	value: parseEther('1')
		// })
		// await createWalletClient({
		// 	chain: coreTestnet2,
		// 	transport: custom(window.ethereum)
		// }).writeContract(request)		  
	}
	  
	useEffect(() => {
		const fetchInvestment = async () => {
			setProjectId(Number((await params).id))
			try {
				const response = await fetch(`/api/investments?id=${(await params).id}`)
				const res = await fetch(`/api/users?id=1`)
				const data = await response.json()
				const dt = await res.json()
				setInfo(data.data.result[0])
				setUsr(dt.data.result[0])
				
				const valueCap = await createPublicClient({
					chain: coreTestnet2,
					transport: http()
				  }).readContract({
					address: '0x35B55F36A88240BAbC35F9681163c57608D34CeD',
					abi: wagmiAbi,
					functionName: 'cap',
				})

				const valueBought = await createPublicClient({
					chain: coreTestnet2,
					transport: http()
				  }).readContract({
					address: '0x35B55F36A88240BAbC35F9681163c57608D34CeD',
					abi: wagmiAbi,
					functionName: 'bought',
				})

				const valueInvestors = await createPublicClient({
					chain: coreTestnet2,
					transport: http()
				  }).readContract({
					address: '0x35B55F36A88240BAbC35F9681163c57608D34CeD',
					abi: wagmiAbi,
					functionName: 'investors',
				})

				const addressToken = await createPublicClient({
					chain: coreTestnet2,
					transport: http()
				  }).readContract({
					address: '0x35B55F36A88240BAbC35F9681163c57608D34CeD',
					abi: wagmiAbi,
					functionName: 'token',
				})

				setCap(valueCap)
				setBought(valueBought)
				setInvestors(valueInvestors)
				setToken(addressToken)
				
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
										{formatEther(cap)} <span className={`text-2xl`}>{coreTestnet2.nativeCurrency.symbol}</span> 
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
									<Dialog>
										<DialogTrigger>
											<div className={`border border-accent rounded-xl p-2 text-center cursor-pointer font-bold hover:bg-accent hover:text-white`}>
												{usr?.approved && usr?.approved.includes(projectId) ? "Invest" : "Register Interest"}
											</div>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>
													{usr?.approved && usr?.approved.includes(projectId) ? isSuccess ? "Transaction successful!" : "How much you want to invest?" : "Thank you for your interest"}
												</DialogTitle>
												<DialogDescription>
													{usr?.approved && usr?.approved.includes(projectId) ? isSuccess ? "You can close this window now." : "Please enter the amount you want to invest and ensure that you have sufficient fund to pay." : "Please leave your EVM wallet address for us to whitelist you and your email address so that we can notify you."}
												</DialogDescription>
											</DialogHeader>
											{usr?.approved && usr?.approved.includes(projectId) ? (
												isSuccess ? (
													<div className={`grid gap-2`}>
														<DialogClose disabled={amount <= 0} className={`mt-2 border border-accent rounded-xl p-2 w-full text-center cursor-pointer font-bold hover:bg-accent hover:text-white`}>
															Close
														</DialogClose>
													</div>
												) : (
													<div className={`grid gap-2`}>
														<div className={`grid`}>
															<label className={`pl-2 font-bold text-xs`}>Amount to buy</label>
															<input required={true} type={`number`} placeholder={`Please enter the amount of token you want`} className={`border border-accent rounded-xl p-2`} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
														</div>
														<div className={`w-full`}>
															<button type={`submit`} onClick={() => buyToken()} disabled={amount <= 0} className={`disabled:opacity-50 mt-2 border border-accent rounded-xl p-2 w-full text-center cursor-pointer font-bold hover:bg-accent hover:text-white`}>
																Submit
															</button>
														</div>
													</div>
												)										
											) : (
												<div className={`grid gap-2`}>
													<div className={`grid`}>
														<label className={`pl-2 font-bold text-xs`}>EVM Wallet address</label>
														<input required={true} type={`text`} maxLength={42} placeholder={`Please enter your EVM Wallet address`} className={`border border-accent rounded-xl p-2`} value={evm} onChange={(e) => setEvm(e.target.value)} />
													</div>
													<div className={`grid`}>
														<label className={`pl-2 font-bold text-xs`}>Email address</label>
														<input required={true} type={`email`} placeholder={`Please enter your email`} className={`border border-accent rounded-xl p-2`} value={email} onChange={(e) => setEmail(e.target.value)} />
													</div>
													<DialogClose disabled={!isValidEmail(email) || !isAddress(evm)} className={`disabled:opacity-50`}>
														<div className={`w-full`}>
															<button type={`submit`} onClick={() => submitInterest()} className={`mt-2 border border-accent rounded-xl p-2 w-full text-center cursor-pointer font-bold hover:bg-accent hover:text-white`}>
																Submit
															</button>
														</div>
													</DialogClose>
												</div>
											)}
										</DialogContent>
									</Dialog>

									<div className={`my-2 border border-foreground/15`} />
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Blockchain Network
										</p>
										<p className={`text-right font-bold`}>
											{info?.chain}
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Token Address
										</p>
										<p className={`text-right font-bold`}>
											{truncateAddress(token, 6, -4)}
										</p>
									</div>
									<div className={`my-2 border border-foreground/15`} />
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											No. of investors
										</p>
										<p className={`text-right font-bold`}>
											{investors}
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Min. investment
										</p>
										<p className={`text-right font-bold`}>
											{formatEther(parseEther(info?.minimum))} {coreTestnet2.nativeCurrency.symbol}
										</p>
									</div>
									<div className={`grid grid-cols-2 gap-2`}>
										<p className={``}>
											Max. investment
										</p>
										<p className={`text-right font-bold`}>
											{formatEther(parseEther(info?.maximum))} {coreTestnet2.nativeCurrency.symbol}
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
