import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { newsletter } from "@/db/schema"

export async function GET() {
	let result
  
	try {
		result = await db.select().from(newsletter)
		
		return NextResponse.json({
			status: 200,
			data: {
				msg: "Successful in fetching newsletter subscribers.",
				result
			}
		})
	} catch {
		return NextResponse.json({
			status: 500,
			data: {
				msg: "Failed to fetch newsletter subscribers.",
				result
			}
		})
	}
}

export async function POST(req: NextRequest) {
	const {
		name,
        email,
	} = await req.json()

	let result

	try {
		result = await db.insert(newsletter).values({
			name,
            email,
		}).returning()

		return NextResponse.json({
			status: 201,
			data: {
				msg: "Successful in creating newsletter subscriber.",
				result: result[0]
			}
		})
	} catch {
		return NextResponse.json({
			status: 500,
			data: {
				msg: "Failed to create newsletter subscriber",
				result
			}
		})
	}
}