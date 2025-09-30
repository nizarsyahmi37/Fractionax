import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { waitlist } from "@/db/schema"

export async function GET() {
	let result
  
	try {
		result = await db.select().from(waitlist)
		
		return NextResponse.json({
			status: 200,
			data: {
				msg: "Successful in fetching waitlists.",
				result
			}
		})
	} catch {
		return NextResponse.json({
			status: 500,
			data: {
				msg: "Failed to fetch waitlists.",
				result
			}
		})
	}
}

export async function POST(req: NextRequest) {
	const {
        email,
	} = await req.json()

	let result

	try {
		result = await db.insert(waitlist).values({
            email,
		}).returning()

		return NextResponse.json({
			status: 201,
			data: {
				msg: "Successful in creating waitlist.",
				result: result[0]
			}
		})
	} catch {
		return NextResponse.json({
			status: 500,
			data: {
				msg: "Failed to create waitlist",
				result
			}
		})
	}
}