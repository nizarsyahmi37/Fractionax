import step1 from "@/public/image/step-1-browse.png"
import step2 from "@/public/image/step-2-buy.png"
import step3 from "@/public/image/step-3-track.png"

export const general = {
	establishYear: "2025",
	currentYear: "2025",
	title: "Fractionax",
	description: "Own the Unreachable, Together",
	email: "hello@fractionax.app"
	// contact: "https://t.me/nizarsyahmi37"
}

export const terms = {
	loading: "Loading",
	login: "Login",
	dashboard: "Dashboard",
	subscribe: "Subscribe",
	email: "Email",
	name: "Name",
	your_email: "Your Email",
	your_name: "Your Name",
	coming_soon: "Coming soon",
	rights_reserved: "All rights reserved",
	start_investing: "Start investing",
	explore_assets: "Explore assets",
	connect_with_us: "Connect with us",
	scroll_down: "Scroll down"
}

export const navigation = {
	main: [
		{
			id: "home",
			title: "Home",
			description: null,
			link: "/",
			type: "internal",
			icon: null
		},
		{
			id: "about",
			title: "About",
			description: null,
			link: "/about",
			type: "internal",
			icon: null
		}
	],
	footer: {
		owners: {
			title: "Owners",
			data: [
				{
					id: "asset-listing",
					title: "List",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "project-liquidity",
					title: "Liquidity",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "white-labelling",
					title: "SaaS",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "dashboard/owner",
					title: "Dashboard",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				}
			]
		},
		investors: {
			title: "Investors",
			data: [
				{
					id: "marketplace",
					title: "Marketplace",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "portfolio",
					title: "Portfolio",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "yields",
					title: "Yields",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "dashboard/investor",
					title: "Dashboard",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				}
			]
		},
		fractionax: {
			title: "Fractionax",
			data: [
				{
					id: "about",
					title: "About",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "partners",
					title: "Partners",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "compliance",
					title: "Compliance",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "contact",
					title: "Contact",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				}
			]
		},
		explore: {
			title: "Explore",
			data: [
				{
					id: "insights",
					title: "Insights",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "academy",
					title: "Academy",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "tutorials",
					title: "Tutorials",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				},
				{
					id: "docs",
					title: "Docs",
					description: null,
					link: "#",
					type: "internal",
					icon: null
				}
			]
		}
	},
	legal: [
		{
			id: "privacy",
			title: "Privacy",
			description: null,
			link: "/privacy",
			type: "internal",
			icon: null
		},
		{
			id: "terms",
			title: "Terms",
			description: null,
			link: "/terms",
			type: "internal",
			icon: null
		},
	]
}

export const socials = {
	data: [
		// {
		// 	id: "telegram",
		// 	title: "Telegram",
		// 	description: null,
		// 	type: "external",
		// 	link: "https://t.me/fractionaxapp",
		// 	icon: null
		// },
        {
            id: "x",
            title: "X",
			description: null,
			type: "external",
            link: "https://x.com/fractionaxapp",
			icon: null
        },
        {
            id: "instagram",
            title: "Instagram",
			description: null,
			type: "external",
            link: "https://instagram.com/fractionaxapp",
			icon: null
        },
        {
            id: "youtube",
            title: "Youtube",
			description: null,
			type: "external",
            link: "https://youtube.com/@fractionaxapp",
			icon: null
        }
	]
}

export const errors = {
	invalid_email: "Invalid email address.",
	invalid_name_char_length: "Input must be at least 2 characters.",
	invalid_name_characters: "Invalid characters used for name.",
	invalid_name_only_symbols: "Name cannot be all symbols or special characters."
}

export const newsletter = {
	title: "Don't Miss The Next Big Move",
	description: "Join thousands of savvy investors getting expert insights, market trends, and early updates from Fractionax — absolutely free.",
	promise: "We promise we won't spam you.",
	notification: "You submitted the following values"
}

export const footer = {
	risk_disclosure: "Risk disclosure",
	risk_disclosure_info: "All investments carry inherent risks, including the potential loss of capital. Past performance does not guarantee future results. Asset values may fluctuate due to market conditions and other factors. You are solely responsible for conducting your own due diligence before making any investment decisions."
}

export const home = {
	hero: {
		kicker: "🚀 Breaking barriers to investment",
		headline: "Own a Piece of Premium Assets",
		headline_alt: "From Just $1",
		subheadline: "Break into high-value investments without the high buy-in. Buy and trade fractional ownership in real world assets, earn passive income, and enjoy full liquidity — all in one secure platform."
	},
	process: {
		kicker: "📋 How it works",
		headline: "Start Investing in",
		headline_alt: "3 Easy Steps",
		subheadline: "In just a few clicks, you'll be on your way to building your investment portfolio—easy, transparent, and accessible for everyone.",
		steps: [
			{
				id: "step-1",
				title: "Browse asset listings",
				description: "Explore a diverse range of curated assets and discover opportunities that align with your financial goals and risk appetite.",
				image: step1.src
			},
			{
				id: "step-2",
				title: "Buy fractions securely",
				description: "Invest with confidence using secure transactions, supporting both fiat and cryptocurrency payments for maximum flexibility.",
				image: step2.src
			},
			{
				id: "step-3",
				title: "Track your ownership",
				description: "Monitor your portfolio in real time, view returns, track valuations, and measure the positive impact of your investments.",
				image: step3.src
			}
		]
	}
}