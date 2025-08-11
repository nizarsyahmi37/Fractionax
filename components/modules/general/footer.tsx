import { Copyright } from "lucide-react"
import { getProjectInfo } from "@/lib/versions"

import ImageLettermark from "@/components/modules/image/lettermark"
import { terms } from "@/locales/en"

export default function Footer() {
	return (
		<footer className="bg-primary text-primary-foreground grid gap-8 lg:gap-12 z-[101]">
			<ImageLettermark
                title={getProjectInfo().title}
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_2fr] gap-4 lg:gap-8 p-4 lg:p-8">
                
			</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_2fr] gap-4 lg:gap-8 p-4 lg:p-8">
                <p className="flex gap-1 items-center">
					<Copyright className="w-[0.9rem] h-[0.9rem]" /> <span className="font-bold">
						{getProjectInfo().year}
					</span> {getProjectInfo().title} | {terms.rights_reserved}
				</p>
			</div>
		</footer>
	)
}