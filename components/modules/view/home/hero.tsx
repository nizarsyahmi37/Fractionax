import { home, terms } from "@/locales/en"
import { Button } from "../../button"
import { InteractiveGridPattern } from "@/components/ui/shadcn-io/interactive-grid-pattern"
import { cn } from "@/lib/utils"

export default function ViewHomeHero() {
	return (
		<section
			id={`hero`}
			className={`grid grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-2 min-h-[75vh] items-center align-middle`}
		>
			<div className="z-10 col-start-1 col-end-3 row-start-1 row-end-2 relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 bg-background">
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
					<Button
						type={`submit`}
						eventName={`Start Investing`}
						eventValue={`homeHeroStartInvesting`}
						buttonTitle={terms.start_investing}
						className={`text-md md:text-base bg-primary text-background border-primary border-2 font-bold rounded-xl cursor-pointer px-4 py-2 duration-300 hover:scale-105 hover:bg-background hover:text-foreground `}
					/>
					<Button
						type={`submit`}
						eventName={`Explore assets`}
						eventValue={`homeHeroExploreAssets`}
						buttonTitle={terms.explore_assets}
						className={`text-md md:text-base bg-background text-foreground border-secondary border-2 font-bold rounded-xl cursor-pointer px-4 py-2 duration-300 hover:scale-105 hover:bg-secondary hover:text-secondary-foreground`}
					/>
				</div>
			</div>
		</section>
	)
}