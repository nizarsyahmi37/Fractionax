"use client"

import { useState, useMemo } from "react"
import { Search, Grid3X3, List, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import ViewHomeListingGrid from "./grid"
import ViewHomeListingList from "./list"
import ViewHomeListingPagination from "./pagination"
import { ListingItem } from "@/types/listing"

type ViewMode = "list" | "grid"
type VotingFilter = "all" | "voted" | "not-voted"
type StatusFilter = "all" | "passed" | "pending" | "rejected"

const ITEMS_PER_PAGE = 8

export default function ViewHomeListing({
	proposalData
} : {
	proposalData: ListingItem[]
}) {
	const [viewMode, setViewMode] = useState<ViewMode>("list")
	const [votingFilter, setVotingFilter] = useState<VotingFilter>("all")
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
	const [currentPage, setCurrentPage] = useState(1)
	const [searchTerm, setSearchTerm] = useState("")

	// Filter and search logic
	const filteredData = useMemo(() => {
		let filtered = proposalData

		// // Apply voting filter
		// if (votingFilter === "voted") {
		// 	filtered = filtered.filter(item => item.voted)
		// } else if (votingFilter === "not-voted") {
		// 	filtered = filtered.filter(item => !item.voted)
		// }

		// // Apply status filter
		// if (statusFilter !== "all") {
		// 	filtered = filtered.filter(item => item.status.toLowerCase() === statusFilter)
		// }

		// // Apply search filter
		// if (searchTerm) {
		// 	filtered = filtered.filter(item =>
		// 		item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
		// 		item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
		// 		item.creator.toLowerCase().includes(searchTerm.toLowerCase())
		// 	)
		// }

		return filtered
	}, [votingFilter, statusFilter, searchTerm, proposalData])

	// Pagination logic
	const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
	const endIndex = startIndex + ITEMS_PER_PAGE
	const paginatedData = filteredData.slice(startIndex, endIndex)

	// Reset to first page when filters change
	useMemo(() => {
		setCurrentPage(1)
	}, [votingFilter, statusFilter, searchTerm])

	return (
		<div className="p-4">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">
					All Proposals
				</h1>
				<p className="text-muted-foreground mt-2">
					Review and vote on community proposals
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-4 mb-6">
				<div className="flex-1 max-w-sm">
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search items..."
							className="pl-10"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>
				
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
					<Select value={votingFilter} onValueChange={(value: VotingFilter) => setVotingFilter(value)}>
						<SelectTrigger className="w-full sm:w-[130px] cursor-pointer">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Voting</SelectItem>
							<SelectItem value="voted">Voted</SelectItem>
							<SelectItem value="not-voted">Not Voted</SelectItem>
						</SelectContent>
					</Select>

					<Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
						<SelectTrigger className="w-full sm:w-[120px] cursor-pointer">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="passed">Passed</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
						</SelectContent>
					</Select>

					<div className="flex items-center border rounded-md w-full sm:w-auto">
						<Button
							variant={viewMode === "list" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("list")}
							className="rounded-r-none flex-1 sm:flex-none cursor-pointer"
						>
							<List className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "grid" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("grid")}
							className="rounded-l-none flex-1 sm:flex-none cursor-pointer"
						>
							<Grid3X3 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<div className="transition-all duration-200 ease-in-out">
				{paginatedData.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-muted-foreground mb-2">
							No items found
						</div>
						<p className="text-sm text-muted-foreground">
							Try adjusting your search or filter criteria
						</p>
					</div>
				) : (
					<>
						{viewMode === "grid" ? (
							<ViewHomeListingGrid paginatedData={paginatedData} />
						) : (
							<ViewHomeListingList paginatedData={paginatedData} />
						)}
						<ViewHomeListingPagination
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalPages={totalPages}
							filteredData={filteredData}
							startIndex={startIndex}
							endIndex={endIndex}
						/>
					</>
				)}
			</div>
		</div>
	)
}