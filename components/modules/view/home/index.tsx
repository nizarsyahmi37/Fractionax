import MouseScrollDown from "@/components/ui/mouse-scroll"
import ViewHomeHero from "./hero"
import ViewHomeProcess from "./process"

export function ViewHome() {
	return (
		<div>
			<ViewHomeHero />
			<div className={`hidden md:block`}>
				<MouseScrollDown />
			</div>
			<ViewHomeProcess />
		</div>
	)
}
