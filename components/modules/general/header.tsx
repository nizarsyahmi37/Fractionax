"use client"

import { useRouter } from "next/navigation"
import { general } from "@/locales/en"

import ButtonTheme from "@/components/modules/button/theme"
import ImageDynamic from "../image/dynamic"
// import ButtonLaunch from "@/components/modules/button/launch"
// import ButtonLogo from "@/components/modules/button/logo"

export default function Header() {
	const router = useRouter()

	return (
		<header className="bg-background/75 bg-clip-content backdrop-filter backdrop-blur-[3px] grid grid-cols-[1fr_auto] gap-2 md:gap-8 xl:gap-12 w-full sticky top-0 z-[102]">
			<div className="grid items-center px-4 lg:px-8 gap-4 lg:gap-8">
				<ImageDynamic
					title={general.title}
					className={`w-auto h-auto cursor-pointer mb-1 max-h-[3rem] [transition-duration:500ms] hover:scale-105`}
					light={"/brand/assets/lettermark/primary.svg"}
					dark={"/brand/assets/lettermark/primary.svg"}
					width={221.59}
					height={48}
					useWindowWidth={true}
					useWindowHeight={true}
					onClick={() => router.push("/")}
				/>
			</div>
			<div className="grid grid-cols-[auto_1fr] items-center gap-4 p-4 lg:px-8">
				<ButtonTheme />
				{/* <ButtonLaunch
					normal={true}
				/> */}
			</div>
		</header>
	)
}