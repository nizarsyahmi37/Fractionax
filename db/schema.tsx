import { pgTable, serial, text, timestamp, varchar, json, numeric } from "drizzle-orm/pg-core"

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
	dateEdited: timestamp("date_edited"),
	minimum: numeric("minimum", { precision: 10, scale: 9 }).notNull(),
	maximum: numeric("maximum", { precision: 10, scale: 9 }).notNull()  
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

export const interest = pgTable("interests", {
	id: serial("id").primaryKey(),
	email: varchar("email", { length: 255 }).notNull(),
	evmWallet: varchar("evm_wallet", { length: 42 }).notNull(),
	interestId: text("interest_id").notNull(),
	dateCreated: timestamp("date_created").defaultNow()
})

export const waitlist = pgTable("waitlists", {
	id: serial("id").primaryKey(),
	email: varchar("email", { length: 255 }).notNull(),
	dateCreated: timestamp("date_created").defaultNow(),
	dateUpdated: timestamp("date_updated").defaultNow()
})

export const newsletter = pgTable("newsletters", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	dateCreated: timestamp("date_created").defaultNow(),
	dateUpdated: timestamp("date_updated").defaultNow()
})