"use client"

import { navigation } from "@/locales/en"
import { useRouter } from "next/navigation"
import { NavigationFooter } from "../navigation/footer"

export function CardFooter() {
	const router = useRouter()

	return (
		<div className={`grid xl:grid-cols-2 gap-x-4 gap-y-8`}>
			<div className={`grid grid-cols-2 gap-x-4 gap-y-8`}>
				<div>
					<NavigationFooter
						title={navigation.footer.owners.title}
						data={navigation.footer.owners.data}
						className={`grid gap-2`}
					/>
				</div>
				<div>
					<NavigationFooter
						title={navigation.footer.investors.title}
						data={navigation.footer.investors.data}
						className={`grid gap-2`}
					/>
				</div>
			</div>
			<div className={`grid grid-cols-2 gap-2`}>
				<div>
					<NavigationFooter
						title={navigation.footer.fractionax.title}
						data={navigation.footer.fractionax.data}
						className={`grid gap-2`}
					/>
				</div>
				<div>
					<NavigationFooter
						title={navigation.footer.explore.title}
						data={navigation.footer.explore.data}
						className={`grid gap-2`}
					/>
				</div>
			</div>
		</div>
	)
}
