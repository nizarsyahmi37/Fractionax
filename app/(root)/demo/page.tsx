"use client"

import { wagmiAbi } from "@/abi"
import { general } from "@/locales/en"
import { Link } from "lucide-react"
import { useEffect, useState } from "react"
import { createPublicClient, formatEther, getAddress, http, isAddress, parseEther } from "viem"
import { coreTestnet2 } from "viem/chains"
import { useRouter } from "next/navigation"
import { Progress } from "radix-ui"
import { useAppKitAccount } from "@reown/appkit/react"
import { useWriteContract } from "wagmi"


import ImageDynamic from "@/components/modules/image/dynamic"
import { isValidEmail, truncateAddress } from "@/lib/utils"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
export default function Page() {
	const router = useRouter()
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
				evmWallet: evm
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
	}

	useEffect(() => {
		const fetchInvestment = async () => {
			try {				
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
	}, [])

	return (
		<div className={`grid grid-rows-[auto_1fr] gap-4`}>
			<div className={`grid grid-cols-[1fr_auto] border-2 border-primary rounded-2xl p-4 items-center align-middle`}>
				<p>
					This is just a demo on Core DAO Testnet2
				</p>
				<appkit-button />
			</div>
			<div>
				<div className={`grid grid-cols-[auto_1fr] gap-4 lg:gap-8 items-center align-middle p-4`}>
					<div>
						<ImageDynamic
							title={general.title}
							className={`w-auto h-auto mb-1 max-h-[5.4rem] rounded-2xl`}
							light={"/demo/logo.jpg"}
							dark={"/demo/logo.jpg"}
							width={300}
							height={300}
							useWindowWidth={true}
							useWindowHeight={true}
						/>
					</div>
					<div>
						<h2 className={`text-3xl lg:text-4xl font-bold`}>
							Fractionax
						</h2>
						<p className={`mt-1 mb-2`}>
							An investment platform that unlocks fractional ownership of high-value real-world assets.
						</p>
						<div className={`flex gap-2 items-center align-middle font-bold text-md`}>
							<a
								href={`https://fractionax.app`}
								target={`_blank`}
								title={`Fractionax Website`}
								className={`hover:scale-105 hover:text-secondary`}
							>
								Web
							</a> | <a
								href={`https://fractionax.app`}
								target={`_blank`}
								title={`Fractionax X Profile`}
								className={`hover:scale-105 hover:text-secondary`}
							>
								X
							</a>
						</div>
					</div>
				</div>
				<div className={`grid grid-cols-[2fr_1fr] gap-8 my-4`}>
					<ImageDynamic
						title={general.title}
						className={`w-auto h-auto mb-1 rounded-2xl border-foreground/30 border-2`}
						light={"/demo/featured.webp"}
						dark={"/demo/featured.webp"}
						width={1500}
						height={1000}
						useWindowWidth={true}
						useWindowHeight={true}
					/>
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
										{/* {usr?.approved && usr?.approved.includes(projectId) ? "Invest" : "Register Interest"} */}
										Invest
									</div>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>
											{/* {usr?.approved && usr?.approved.includes(projectId) ? isSuccess ? "Transaction successful!" : "How much you want to invest?" : "Thank you for your interest"} */}
											Title
										</DialogTitle>
										<DialogDescription>
											{/* {usr?.approved && usr?.approved.includes(projectId) ? isSuccess ? "You can close this window now." : "Please enter the amount you want to invest and ensure that you have sufficient fund to pay." : "Please leave your EVM wallet address for us to whitelist you and your email address so that we can notify you."} */}
											Description
										</DialogDescription>
									</DialogHeader>
									{
									// usr?.approved && usr?.approved.includes(projectId) ? (
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
									// ) : (
									// 	<div className={`grid gap-2`}>
									// 		<div className={`grid`}>
									// 			<label className={`pl-2 font-bold text-xs`}>EVM Wallet address</label>
									// 			<input required={true} type={`text`} maxLength={42} placeholder={`Please enter your EVM Wallet address`} className={`border border-accent rounded-xl p-2`} value={evm} onChange={(e) => setEvm(e.target.value)} />
									// 		</div>
									// 		<div className={`grid`}>
									// 			<label className={`pl-2 font-bold text-xs`}>Email address</label>
									// 			<input required={true} type={`email`} placeholder={`Please enter your email`} className={`border border-accent rounded-xl p-2`} value={email} onChange={(e) => setEmail(e.target.value)} />
									// 		</div>
									// 		<DialogClose disabled={!isValidEmail(email) || !isAddress(evm)} className={`disabled:opacity-50`}>
									// 			<div className={`w-full`}>
									// 				<button type={`submit`} onClick={() => submitInterest()} className={`mt-2 border border-accent rounded-xl p-2 w-full text-center cursor-pointer font-bold hover:bg-accent hover:text-white`}>
									// 					Submit
									// 				</button>
									// 			</div>
									// 		</DialogClose>
									// 	</div>
									// )
									}
								</DialogContent>
							</Dialog>
							<div className={`my-2 border border-foreground/15`} />
							<div className={`grid grid-cols-2 gap-2`}>
								<p className={``}>
									Blockchain Network
								</p>
								<p className={`text-right font-bold`}>
									{`Core Testnet2`}
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
									{formatEther(parseEther("0.000000001"))} {coreTestnet2.nativeCurrency.symbol}
								</p>
							</div>
							<div className={`grid grid-cols-2 gap-2`}>
								<p className={``}>
									Max. investment
								</p>
								<p className={`text-right font-bold`}>
										{formatEther(parseEther("1"))} {coreTestnet2.nativeCurrency.symbol}
								</p>
							</div>
							<div className={`my-2 border border-foreground/15`} />
							<div className={`grid grid-cols-2 gap-2`}>
								<p className={``}>
									Investment Structure
								</p>
								<p className={`text-right font-bold`}>
									{`Economic Interest`}
								</p>
							</div>
							<div className={`grid grid-cols-2 gap-2`}>
								<p className={``}>
									Token claim
								</p>
								<p className={`text-right font-bold`}>
									{`Instant`}
								</p>
							</div>
							<div className={`grid grid-cols-2 gap-2`}>
								<p className={``}>
									Dividend yield
								</p>
								<p className={`text-right font-bold`}>
									{`N/A`}
								</p>
							</div>
							<div className={`grid grid-cols-2 gap-2`}>
								<p className={``}>
									Investment period
								</p>
								<p className={`text-right font-bold`}>
									{`N/A`}
								</p>
							</div>
							<div className={`grid grid-cols-2 gap-2`}>
								<p className={``}>
									Distribution Frequency
								</p>
								<p className={`text-right font-bold`}>
									{`N/A`}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className={`my-4`}>
					<div className={`grid grid-cols-[auto_1fr] gap-4 align-middle items-center`}>
						<h3 className={`font-bold text-3xl lg:text-4xl`}>
							Summary
						</h3>
						<div className={`h-[1px] border-primary border-t-1`} />
					</div>
					<div className={`p-4 items-center align-middle grid gap-x-4 gap-y-8 grid-cols-1 lg:grid-cols-2`}>
						<ImageDynamic
							title={general.title}
							className={`w-auto h-auto mb-1 rounded-2xl border-foreground/30 border-2`}
							light={"/demo/introduction.webp"}
							dark={"/demo/introduction.webp"}
							width={1500}
							height={1000}
							useWindowWidth={true}
							useWindowHeight={true}
						/>
						<p>
							Fractionax is a fractional investment platform designed to make high-value asset ownership accessible to everyone.
							<br /><br />
							It enables users to diversify easily across a wide range of opportunities—from real estate and collectibles to innovative projects—all within one platform. Every transaction and share is recorded immutably on the blockchain, ensuring full transparency and trust.
							<br /><br />
							Investors can start with minimal capital, participate from anywhere without limitations, and sell their shares anytime through a regulated marketplace for liquidity. Fractionax prioritizes trust, compliance, and security, partnering with regulated entities and adhering to strict legal, regulatory, and cybersecurity standards to protect investor interests.
						</p>
					</div>
					<div className={`grid gap-8 grid-cols-1 lg:grid-cols-2`}>
						<div className={`items-center align-middle grid gap-4`}>
							<div className={`grid grid-cols-[auto_1fr] gap-4 align-middle items-center`}>
								<h3 className={`font-bold text-3xl lg:text-4xl`}>
									Problem
								</h3>
								<div className={`h-[1px] border-primary border-t-1`} />
							</div>
							<div className={`px-4 grid gap-x-4 gap-y-8`}>
								<ImageDynamic
									title={general.title}
									className={`w-auto h-auto mb-1 rounded-2xl border-foreground/30 border-2`}
									light={"/demo/problem.png"}
									dark={"/demo/problem.png"}
									width={1500}
									height={1000}
									useWindowWidth={true}
									useWindowHeight={true}
								/>
								<p >
									High-value assets remain locked away from most investors—difficult to sell, costly to enter, and tangled in complex regulations—leaving both asset owners and everyday investors on the sidelines.
								</p>
							</div>
						</div>
						<div className={`items-center align-middle grid gap-4`}>
							<div className={`grid grid-cols-[auto_1fr] gap-4 align-middle items-center`}>
								<h3 className={`font-bold text-3xl lg:text-4xl`}>
									Solution/Feature(s)
								</h3>
								<div className={`h-[1px] border-primary border-t-1`} />
							</div>
							<div className={`px-4 grid gap-x-4 gap-y-8`}>
								<ImageDynamic
									title={general.title}
									className={`w-auto h-auto mb-1 rounded-2xl border-foreground/30 border-2`}
									light={"/demo/solution.png"}
									dark={"/demo/solution.png"}
									width={1500}
									height={1000}
									useWindowWidth={true}
									useWindowHeight={true}
								/>
								<p>
									Fractionax unlocks global access to premium assets through small-ticket investments, instant on-chain liquidity, full ERC-3643 compliance, and seamless DeFi integration for borrowing and lending.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
