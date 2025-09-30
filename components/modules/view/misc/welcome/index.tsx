import { general, socials, team, terms } from "@/locales/en"

import Image from "next/image"
import Link from "next/link"
import ImageDynamic from "@/components/modules/image/dynamic"
import lettermark from "@/public/brand/assets/lettermark/primary.svg"

// import ButtonMode from "../../button/mode"

export default function ViewMiscWelcome() {
	return (
		<section className={`w-full p-4`}>
			<div className={`grid grid-cols-1 gap-4 items-center align-middle justify-center`}>
				<div className={`p-2 grid grid-cols-1 gap-4 max-w-[600px] mx-auto align-middle items-center justify-center`}>
					<div className={`grid gap-0 md:gap-1`}>
						<ImageDynamic
							title={`${general.title} | ${general.description}`}
							className={`p-3 w-[12rem] h-auto mx-auto py-3 transition duration-300 ease-in-out`}
							light={lettermark.src}
							dark={lettermark.src}
							width={lettermark.width / 4}
							height={lettermark.height / 4}
							useWindowWidth={true}
							useWindowHeight={true}
						/>
						<h3 className={`text-md md:text-xl items-center text-center`}>
							{general.description}
						</h3>
					</div>
					<h3 className={`text-lg text-center font-bold mt-10`}>
						{terms.connect_with_us}
					</h3>
					<div className={`h-1 border-foreground border-t-2 my-2`} />
					<div className={`py-4 w-fit grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 align-middle items-center justify-between max-w-[75vw] mx-auto`}>
						{socials.data.map((item) => (
							<Link
								key={item.id}
								className={`w-full gap-1 grid items-center content-center align-middle justify-center group hover:text-primary`}
								href={item.link}
								title={`${general.title} | ${general.description}`}
								prefetch={true}
							>
								{item.icon}
								<p className={`text-center text-xs font-semibold group-hover:scale-105`}>
									{item.title}
								</p>
							</Link>
						))}
						{/*
						<Link
							className={`w-fit gap-1 grid items-center content-center align-middle justify-center group hover:text-primary`}
							href={"https://pinterest.com/fractionaxapp"}
							title={`${general.title} | ${general.description}`}
							prefetch={true}
						>
							<FaPinterest className={`mx-auto w-8 h-8 group-hover:scale-110`} />
							<p className={`text-center text-xs font-semibold group-hover:scale-105`}>
								Pinterest
							</p>
						</Link>
						<Link
							className={`w-fit gap-1 grid items-center content-center align-middle justify-center group hover:text-primary`}
							href={"https://patreon.com/fractionaxapp"}
							title={`${general.title} | ${general.description}`}
							prefetch={true}
						>
							<FaPatreon className={`mx-auto w-8 h-8 group-hover:scale-110`} />
							<p className={`text-center text-xs font-semibold group-hover:scale-105`}>
								Patreon
							</p>
						</Link>
						<Link
							className={`w-fit gap-1 grid items-center content-center align-middle justify-center group hover:text-primary`}
							href={"https://reddit.com/u/fractionaxapp"}
							title={`${general.title} | ${general.description}`}
							prefetch={true}
						>
							<FaRedditAlien className={`mx-auto w-8 h-8 group-hover:scale-110`} />
							<p className={`text-center text-xs font-semibold group-hover:scale-105`}>
								Reddit
							</p>
						</Link>
						<Link
							className={`w-fit gap-1 grid items-center content-center align-middle justify-center group hover:text-primary`}
							href={"https://tiktok.com/@fractionaxapp"}
							title={`${general.title} | ${general.description}`}
							prefetch={true}
						>
							<FaTiktok className={`mx-auto w-8 h-8 group-hover:scale-110`} />
							<p className={`text-center text-xs font-semibold group-hover:scale-105`}>
								Tiktok
							</p>
						</Link> */}
					</div>
					<h3 className={`text-lg text-center font-bold mt-10`}>
						{terms.our_team}
					</h3>
					<div className={`h-1 border-foreground border-t-2 my-2`} />
					<div className={`py-4 w-full grid grid-cols-2 gap-8 align-middle items-center justify-between max-w-[75vw] mx-auto`}>
						{team.data.map((item) => (
							<div
								key={item.id}
								className={`w-full grid items-center content-center`}
							>
								<ImageDynamic
									title={`${item.title} | ${item.description}`}
									className={`p-3 w-[12rem] h-auto mx-auto transition duration-300 ease-in-out`}
									light={item.image.src}
									dark={item.image.src}
									width={item.image.width / 4}
									height={item.image.height / 4}
									useWindowWidth={true}
									useWindowHeight={true}
								/>
								<h3 className={`font-bold text-xl text-center`}>
									{item.title}
								</h3>
								<h4 className={`text-sm text-center`}>
									{item.description}
								</h4>
								<div className={`mx-auto py-4 w-fit flex gap-8 align-middle items-center max-w-[75vw]`}>
									{item.socials.map((itm) => (
										<Link
											key={itm.id}
											className={`w-full gap-1 grid items-center content-center align-middle justify-center group hover:text-primary`}
											href={itm.link}
											title={`${item.title} on ${itm.title}`}
											prefetch={true}
										>
											{itm.icon}
										</Link>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
