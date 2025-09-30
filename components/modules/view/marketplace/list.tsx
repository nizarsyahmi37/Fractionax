import { toast } from "sonner"
import { Copy, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { truncateAddress } from "@/lib/utils"

export default function ViewHomeListingList({
	paginatedData,
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
		<div className="border rounded-lg overflow-hidden">
			<div className="hidden md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Creator</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Voting</TableHead>
							<TableHead>Votes</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedData.map((item) => (
							<TableRow key={item.id} className="hover:bg-muted/50">
								<TableCell>
									<div className="min-w-[25vw] w-full max-w-[500px]">
										<div className="font-medium">{item.title}</div>
										<div className="text-sm text-muted-foreground text-wrap">
											{item.description}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<p className="flex items-center gap-2 text-sm text-muted-foreground">
										{truncateAddress(item.creator, 4, 38)}
										<Copy size={15} onClick={() => handleCopy(item.creator)} className="cursor-pointer hover:text-primary" />
										<a href={`https://etherscan.io/address/${item.creator}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
											<ExternalLink size={15} />
										</a>
									</p>
								</TableCell>
								<TableCell>
									<Badge className={getStatusColor(item.status)} variant="secondary">
										{item.status}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge variant={item.voted ? "default" : "secondary"}>
										{item.voted ? "Voted" : "Not Voted"}
									</Badge>
								</TableCell>
								<TableCell>{item.votes}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="md:hidden">
				{paginatedData.map((item) => (
					<div key={item.id} className="p-4 border-b last:border-b-0 hover:bg-muted/50">
						<div className="flex items-start justify-between mb-2">
							<h3 className="font-medium text-base">
								{item.title}
							</h3>
						</div>
						<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
							{item.description}
						</p>
						<div className="flex items-center gap-2 mb-2">
							<Badge className={getStatusColor(item.status)} variant="secondary">
								{item.status}
							</Badge>
							<Badge variant={item.voted ? "default" : "secondary"}>
								{item.voted ? "Voted" : "Not Voted"}
							</Badge>
						</div>
						<div>
							<div className="flex items-center justify-between text-sm text-muted-foreground">
								<p className="flex items-center gap-2 text-sm text-muted-foreground">
									{truncateAddress(item.creator, 4, 38)}
									<Copy size={15} onClick={() => handleCopy(item.creator)} className="cursor-pointer hover:text-primary" />
									<a href={`https://etherscan.io/address/${item.creator}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
										<ExternalLink size={15} />
									</a>
								</p>
								<div className="flex items-center gap-3">
									<span>{item.votes} votes</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}