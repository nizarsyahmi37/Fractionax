import { CardMarketplaceFilter } from "@/components/modules/card/marketplace/filter"
import { CardMarketplaceProject } from "@/components/modules/card/marketplace/project"

export default function Page() {
	return (
		<div className={`grid gap-8`}>
			<CardMarketplaceFilter />
			<div className={`grid grid-cols-3 gap-4`}>
				<CardMarketplaceProject />
			</div>
		</div>
	)
}
