import { general } from "@/locales/en"

import ButtonTheme from "@/components/modules/button/theme"
import ButtonLogo from "../button/logo"
// import ButtonLaunch from "@/components/modules/button/launch"

export default function Header() {
	return (
		// <header className={`bg-gradient-to-br from-0% from-background/60 via-40% via-background/75 to-100% to-background/60 bg-clip-content backdrop-filter backdrop-blur-[3px] grid grid-cols-[1fr_auto] gap-2 md:gap-8 xl:gap-12 w-full sticky top-0 z-[102] min-h-[85.58px]`}>
		<header className={`bg-background/60 bg-clip-content backdrop-filter backdrop-blur-[3px] grid grid-cols-[1fr_auto] gap-2 md:gap-8 xl:gap-12 w-full sticky top-0 z-[102] min-h-[85.58px]`}>
			<div className={`grid items-center px-4 lg:px-8 gap-4 lg:gap-8`}>
				<h1 className={`hidden`}>
					{general.title}
				</h1>
				<ButtonLogo />
			</div>
			<div className={`grid grid-cols-[auto_1fr] items-center gap-4 p-4`}>
				<ButtonTheme />
				{/* <ButtonLaunch
					normal={true}
				/> */}
			</div>
		</header>
	)
}