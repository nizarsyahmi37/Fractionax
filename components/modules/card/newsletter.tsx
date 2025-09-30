"use client"

import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { errors, newsletter, terms } from "@/locales/en"
import { ButtonWithGTM } from "../button"

const FormSchema = z.object({
	name: z.string()
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
	),
	email: z.email({
		message: errors.invalid_email
	})
})

export function CardNewsletter() {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: "",
			email: ""
		}
	})

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		const response = await fetch("/api/newsletter", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name: data.name,
				email: data.email
			})
		})
		const res = await response.json()
		toast(newsletter.notification, {
			description: (
				<pre className={`mt-2 w-[320px] rounded-md bg-foreground p-4`}>
					<code className={`text-background`}>
						{JSON.stringify(data, null, 2)}
						{/* {res} */}
					</code>
				</pre>
			)
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className={`w-full space-y-3`}>
				<div className={`grid gap-1`}>
					<h3 className={`text-primary text-xl font-bold`}>
						{newsletter.title}
					</h3>
					<p className={`text-sm text-foreground`}>
						{newsletter.description}
					</p>
				</div>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<p className={`text-sm font-bold`}>
									{terms.name}
								</p>
							</FormLabel>
							<FormControl>
								<Input
									type="text"
									placeholder={terms.your_name}
									className={`focus-visible:ring-primary/50`}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<p className={`text-sm font-bold`}>
									{terms.email}
								</p>
							</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder={terms.your_email}
									className={`focus-visible:ring-primary/50`}
									{...field}
								/>
							</FormControl>
							<FormMessage />
							<FormDescription>
								{newsletter.promise}
							</FormDescription>
						</FormItem>
					)}
				/>
				<ButtonWithGTM
					type={`submit`}
					eventName={`Subscribe to Newsletter`}
					eventValue={`newsletterSubscription`}
					buttonTitle={terms.subscribe}
					className={`bg-secondary text-secondary-foreground font-bold rounded-xl cursor-pointer px-4 py-2 duration-300 hover:scale-105`}
				/>
			</form>
		</Form>
	)
}
