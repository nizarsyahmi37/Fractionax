import ViewComingSoon from "@/components/module/view/coming-soon"

export default function Page() {
	return (
		<div>
			<header></header>
			<main
				className={`min-h-[100vh] items-center content-center`}
			>
				<ViewComingSoon />
			</main>
			<footer></footer>
		</div>
	)
}
