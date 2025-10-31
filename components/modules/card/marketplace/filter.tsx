"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { errors, terms } from "@/locales/en"
import { ButtonWithGTM } from "../../button"

const FormSchema = z.object({
	terms: z.string()
	.min(2, {
		message: errors.invalid_name_char_length
	})
	.regex(/^[A-Za-z\s@-]+$/, {
		message: errors.invalid_name_characters
	})
	.refine(
		(value) => /[A-Za-z]/.test(value),
		{
			message: errors.invalid_name_only_symbols
		}
	)
})

export function CardMarketplaceFilter() {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			terms: ""
		}
	})

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		const response = await fetch("/api/search", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				terms: data.terms
			})
		})
		// const res = await response.json()
		await response.json()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className={`w-full space-y-3`}>
				<FormField
					control={form.control}
					name="terms"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<p className={`text-sm font-bold`}>
									{terms.search}
								</p>
							</FormLabel>
							<div className={`grid grid-cols-[1fr_auto] gap-4`}>
								<FormControl>
									<Input
										type="text"
										placeholder={`${terms.search_projects}...`}
										className={`focus-visible:ring-primary/50`}
										{...field}
									/>
								</FormControl>
								<ButtonWithGTM
									type={`submit`}
									eventName={`Search projects on marketplace`}
									eventValue={`marketplaceSearch`}
									buttonTitle={terms.search}
									className={`bg-secondary text-secondary-foreground font-bold rounded-xl cursor-pointer px-4 py-2 duration-300 hover:scale-105`}
								/>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	)
}
