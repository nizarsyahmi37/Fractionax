"use client"

import { useRouter } from "next/navigation"
import { Link } from "@/types/general"

export default function NavigationLegal({
    nav,
	className
} : {
    nav: Link[]
	className?: string
}) {
	const router = useRouter()

	return (
        <ul className={`flex gap-3 lg:gap-6`}>
			{nav.map((item) => (
				<li
					key={item.id}
					onClick={() => router.push(item.link)}
					title={item.title}
					className={`${className} cursor-pointer font-bold hover:scale-105 hover:text-secondary`}
				>
					{item.title}
			    </li>
			))}
		</ul>
    )
}