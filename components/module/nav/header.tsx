"use client"

import { usePathname, useRouter } from "next/navigation"
import { header } from "@/content/general/nav"

export default function NavHeader() {
	const router = useRouter()
	const pathname = usePathname()

	return (
		<ul
			className={`w-fit flex gap-8 m-auto p-4`}
		>
			{header.map((itm) => (
				<li key={itm.id} className={`cursor-pointer underline-offset-3 ${pathname === itm.link && "underline font-black"} hover:underline hover:scale-105`} onClick={() => router.push(itm.link)}>
					{itm.title}
				</li>
			))}
		</ul>
	)
}