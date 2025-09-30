import { toast } from "sonner"
import { Copy, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { truncateAddress } from "@/lib/utils"

export default function ViewHomeListingGrid({
	paginatedData
} : {
	paginatedData: ListingItem[]
}) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "passed": return "bg-green-100 text-green-800"
			case "pending": return "bg-yellow-100 text-yellow-800"
			case "rejected": return "bg-gray-100 text-gray-800"
			default: return "bg-gray-100 text-gray-800"
		}
	}

	const handleCopy = (item: string) => {
		navigator.clipboard.writeText(item)
		toast("Address copied to clipboard", {
			description: item
		})
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
			{paginatedData.map((item) => (
				<Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<Badge className={getStatusColor(item.status)} variant="secondary">
								{item.status}
							</Badge>
						</div>
						<CardTitle className="text-lg">{item.title}</CardTitle>
						<CardDescription className="line-clamp-2">
							{item.description}
						</CardDescription>
					</CardHeader>
					<CardContent className="pb-3">
						<Label>Proposed by:</Label>
						<p className="flex items-center gap-2 text-sm text-muted-foreground">
							{truncateAddress(item.creator, 4, 38)}
							<Copy size={15} onClick={() => handleCopy(item.creator)} className="cursor-pointer hover:text-primary" />
							<a href={`https://etherscan.io/address/${item.creator}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
								<ExternalLink size={15} />
							</a>
						</p>
					</CardContent>
					<CardFooter className="pt-3 border-t">
						<div className="grid grid-cols-[1fr_auto] gap-2 w-full">
							<div className="flex items-center justify-between w-full">
								<div className="flex items-center gap-2">
									<Badge variant={item.voted ? "default" : "secondary"}>
										{item.voted ? "Voted" : "Not Voted"}
									</Badge>
									<span className="text-sm text-muted-foreground">
										{item.votes} votes
									</span>
								</div>
							</div>
						</div>
					</CardFooter>
				</Card>
			))}
		</div>		
	)
}