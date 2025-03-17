import NavHeader from "@/components/module/nav/header"
import ImageDynamic from "@/components/ui/dynamic-image"

export default async function Header() {
	return (
		<header className={`w-full px-8 py-4 border border-transparent border-b-accent`}>
			<div className={`w-full grid grid-cols-[210px_1fr_auto] gap-4 items-center content-center max-w-[1500px] mx-auto`}>
				<ImageDynamic
					title={`Fractionax`}
					className={`grid w-[75vw] max-w-[210px]`}
					light={"/brand/assets/lettermark/dark.svg"}
					dark={"/brand/assets/lettermark/light.svg"}
					width={1920}
					height={1920}
					useWindowWidth={false}
					useWindowHeight={false}
				/>
				<NavHeader />
				<appkit-button />
			</div>
		</header>
	)
}
