"use client"

import { useRouter } from "next/navigation"

export default function NotFound() {
	const router = useRouter()

	return (
		<div>
			<h2>
				Not Found
			</h2>
			<p>
				Could not find requested resource
			</p>
			<button
				onClick={() => router.push("/")}
			>
				Return Home
			</button>
		</div>
	)
}
