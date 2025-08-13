import { Copyright } from "lucide-react"
import { getProjectInfo } from "@/lib/versions"
import { footer, navigation, socials, terms } from "@/locales/en"
import { CardNewsletter } from "../card/newsletter"
import { CardFooter } from "../card/footer"

import ImageLettermark from "@/components/modules/image/lettermark"
import NavigationLegal from "../navigation/legal"

export default function Footer() {
	return (
		<footer className={`bg-gradient-to-br from-0% from-accent via-60% via-primary to-100% to-accent text-primary-foreground grid gap-8 lg:gap-12 z-[101]`}>
			<ImageLettermark
                title={getProjectInfo().title}
			/>
			<div>
				<div className={`grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] xl:grid-cols-[1fr_1px_2fr] gap-4 lg:gap-8 p-4 lg:p-8`}>
					<div className={`bg-background text-foreground rounded-2xl p-4 lg:p-8`}>
						<CardNewsletter />
					</div>
					<div className={`hidden border-primary-foreground border-l-2 w-full h-full md:block`} />
					<div className={`grid grid-rows-[auto_auto_1fr_auto_auto] gap-4 bg-background/15 text-foreground rounded-2xl p-4 lg:p-8`}>
						<div>
							<h3 className={`font-bold text-primary-foreground`}>
								{footer.risk_disclosure}
							</h3>
							<p className={`text-sm text-primary-foreground/75`}>
								{footer.risk_disclosure_info}
							</p>
						</div>
						<div className={`border-primary-foreground border-t-2 h-[1px] -mx-2`} />
						<div className={`grid items-center align-middle`}>
							<CardFooter />
						</div>
						<div className={`border-primary-foreground border-t-2 h-[1px] -mx-2`} />
						<div className={`grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-y-2 gap-x-4`}>
							<h3 className={`font-bold text-accent-foreground`}>
								{terms.connect_with_us}:
							</h3>
							<div className={`flex gap-4`}>
								{socials.data.map((item) => (
									<a
										key={item.id}
										href={item.link}
										target={`_blank`}
										title={item.description ? item.description : item.title}
									>
										<p
											className={`text-primary-foreground hover:text-secondary`}
										>
											{item.title}
										</p>
									</a>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className={`text-sm`}>
					<div className={`border-primary-foreground border-t-2 mx-4 lg:mx-6`} />
					<div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_2fr] gap-2 lg:gap-4 py-2 px-4 lg:px-8`}>
						<div className={`text-center align-middle mx-auto md:mr-auto md:ml-0`}>
							<p className={`flex gap-1 items-center`}>
								<Copyright className={`w-[0.9rem] h-[0.9rem]`} /> <span className={`font-bold`}>
									{getProjectInfo().year}
								</span> {getProjectInfo().title} | {terms.rights_reserved}
							</p>
						</div>
						<div className={`text-center align-middle mx-auto md:ml-auto md:mr-0`}>
							<NavigationLegal
								nav={navigation.legal}
							/>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}