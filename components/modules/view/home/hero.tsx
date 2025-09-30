"use client"

import { useRouter } from "next/navigation"
import { InteractiveGridPattern } from "@/components/ui/shadcn-io/interactive-grid-pattern"
import { home, terms } from "@/locales/en"
import { cn } from "@/lib/utils"
import { ButtonWithGTM } from "../../button"

export default function ViewHomeHero() {
	const router = useRouter()

	return (
		<section
			id={`hero`}
			className={`grid grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-2 min-h-[75vh] items-center align-middle`}
		>
			<div className="z-10 col-start-1 col-end-3 row-start-1 row-end-3 lg:row-end-2 relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 bg-background">
				<InteractiveGridPattern
					className={cn(
						"[mask-image:radial-gradient(45vh_circle_at_center,white,transparent)]",
						"inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
					)}
					squares={[60, 60]}
					squaresClassName="hover:fill-primary/80 transition-colors duration-300"
				/>
			</div>
			<div className={`z-50 col-start-1 row-start-1 h-fit grid gap-4 text-foreground rounded-2xl p-4 lg:p-8`}>
				<h3 className={`text-xs md:text-sm px-4 py-2 border-primary border-2 bg-primary/15 w-fit rounded-full my-2 mx-auto md:mx-0`}>
					{home.hero.kicker}
				</h3>
				<h2 className={`text-center md:text-start text-3xl md:text-6xl font-bold`}>
					{home.hero.headline} <span className={`text-secondary`}>
						{home.hero.headline_alt}
					</span>
				</h2>
				<p className={`text-center md:text-start text-base md:text-xl`}>
					{home.hero.subheadline}
				</p>
				<div className={`grid md:flex gap-4 my-4 md:my-8`}>
					<ButtonWithGTM
						type={`submit`}
						eventName={`Start Investing`}
						eventValue={`homeHeroStartInvesting`}
						buttonTitle={terms.start_investing}
						onClick={() => router.push("/marketplace")}
						className={`text-md md:text-base bg-primary text-background border-primary border-2 font-bold rounded-xl cursor-pointer px-4 py-2 duration-300 hover:scale-105 hover:bg-background hover:text-foreground `}
					/>
					<ButtonWithGTM
						type={`submit`}
						eventName={`Explore assets`}
						eventValue={`homeHeroExploreAssets`}
						buttonTitle={terms.explore_assets}
						onClick={() => router.push("/marketplace")}
						className={`text-md md:text-base bg-background text-foreground border-secondary border-2 font-bold rounded-xl cursor-pointer px-4 py-2 duration-300 hover:scale-105 hover:bg-secondary hover:text-secondary-foreground`}
					/>
				</div>
			</div>
			<div className={`z-50 col-start-1 row-start-2 lg:col-start-2 lg:row-start-1 h-fit grid gap-4 text-foreground rounded-2xl p-4 lg:p-8`}>
				<div className={`mx-auto relative grid justify-center h-[500px] w-[240px] lg:h-[624px] lg:w-[300px] border-4 border-foreground rounded-2xl`}>
					<span className={`z-[110] mx-auto col-start-1 col-end-2 row-start-1 row-end-2 border border-foreground bg-foreground w-16 h-4 mt-2 rounded-full`} />
					<div className={`col-start-1 col-end-2 row-start-1 row-end-2 grid w-[292px] rounded-[11.5px] max-h-full p-4 pt-8`}>
						<div>
							Makan
						</div>
					</div>

					<span className={`absolute -right-1.5 top-20 border-2 border-foreground h-10 rounded-md`} />

					<span className={`absolute -left-1.5 top-16 border-2 border-foreground h-6 rounded-md`} />
					<span className={`absolute -left-1.5 top-32 border-2 border-foreground h-12 rounded-md`} />
					<span className={`absolute -left-1.5 top-48 border-2 border-foreground h-12 rounded-md`} />
				</div>
			</div>
		</section>
	)
}