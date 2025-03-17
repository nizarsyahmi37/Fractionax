import { pgTable, serial, text, timestamp, varchar, json } from "drizzle-orm/pg-core"

export const investment = pgTable("investments", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	category: text("category").notNull(),
	location: text("location").notNull(),
	country: text("country").notNull(),
	structure: text("structure").notNull(),
	stage: text("stage").notNull(),
	chain: text("chain").notNull(),
	yields: text("yields").notNull(),
	period: text("period").notNull(),
	claim: text("claim").notNull(),
	frequency: text("frequency").notNull(),
	keywords: json("keywords").$type<string[]>(),
	content: text("content").notNull(),
	images: json("images").$type<string[]>(),
	author: varchar("author", { length: 255 }).notNull(),
	contract: varchar("contract", { length: 255 }).notNull(),
	dateCreated: timestamp("date_created").defaultNow(),
	dateApproved: timestamp("date_approved"),
	dateEdited: timestamp("date_edited")
})

export const user = pgTable("users", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	wallet: json("wallet").$type<string[]>(),
	email: varchar("email", { length: 255 }).unique().notNull(),
	request: json("request").$type<number[]>().default([]),
	approved: json("approved").$type<number[]>().default([]),
	dateCreated: timestamp("date_created").defaultNow()
})  