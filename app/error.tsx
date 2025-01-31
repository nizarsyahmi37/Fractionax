"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Error({
	error,
	reset
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	const router = useRouter()
	
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div>
			<h2>
				Something went wrong!
			</h2>
			<button
				onClick={() => reset()}
			>
				Try again
			</button>
			<button
				onClick={() => router.push("/")}
			>
				Return Home
			</button>
		</div>
	)
}
