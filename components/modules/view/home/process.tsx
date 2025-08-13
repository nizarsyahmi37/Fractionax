import { home } from "@/locales/en"
import { CardInfo } from "../../card/info"

import Image from "next/image"

export default function ViewHomeProcess() {
	return (
		<section
			id={`process`}
			className={`grid grid-cols-1 min-h-[75vh] items-center align-middle my-12 lg:my-24`}
		>
			<div className={`mx-auto text-center align-middle items-center max-w-[90vw] md:max-w-[75vw] h-fit grid gap-4 text-foreground rounded-2xl p-4 lg:p-8`}>
				<h3 className={`text-sm md:text-md px-4 py-2 border-secondary border-2 bg-secondary/15 w-fit rounded-full my-2 mx-auto`}>
					{home.process.kicker}
				</h3>
				<h2 className={`text-center text-3xl md:text-6xl font-bold`}>
					{home.process.headline} <span className={`text-primary`}>
						{home.process.headline_alt}
					</span>
				</h2>
				<p className={`text-center text-base md:text-xl`}>
					{home.process.subheadline}
				</p>
			</div>
			<div className={`mx-auto text-center align-middle items-center grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 p-4 lg:p-8`}>
				{home.process.steps.map((item) => (
					<CardInfo
						key={item.id}
						title={item.title}
						image={(
							<Image
								style={{ width: "auto", height: "auto" }}
								width={2000}
								height={1500}
								className={`rounded-t-xl lg:grayscale lg:group-hover:grayscale-0 transition duration-300`}
								alt={item.title}
								src={item.image} />
						)}
						titleClass={`text-xl lg:text-2xl px-4 lg:px-8 group-hover:underline`}
						description={item.description}
						descriptionClass={`text-sm lg:text-base px-4 lg:px-8 text-foreground/75`}
						className={`h-full w-full pb-4 lg:pb-8 group duration-300`}
					/>
				))}
			</div>
		</section>
	)
}