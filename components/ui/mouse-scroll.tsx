import { FC } from "react"
import { terms } from "@/locales/en"

const MouseScrollDown: FC = () => {
	return (
		<div>
			<p className="w-fit mx-auto pt-4 pb-2 text-xs text-center">
				{terms.scroll_down}
			</p>
			<div className="-ml-[3.5px]">
				<div className="mx-auto w-[24px] h-[36px]">
					<div className="w-[3px] p-[6px_12px] h-[24px] border-2 border-foreground rounded-[18px] opacity-75 box-content">
						<div className="w-[3px] h-[6px] rounded-[30%] bg-foreground animate-scroll" />
					</div>
				</div>
			</div>
		</div>
	)
}

export default MouseScrollDown
