import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { interest } from "@/db/schema"

export async function GET() {
	let result
  
	try {
		result = await db.select().from(interest)
		
		return NextResponse.json({
			status: 200,
			data: {
				msg: "Successful in fetching interests.",
				result
			}
		})
	} catch {
		return NextResponse.json({
			status: 500,
			data: {
				msg: "Failed to fetch interests.",
				result
			}
		})
	}
}

export async function POST(req: NextRequest) {
	const {
		email,
		evmWallet,
		interestId
	} = await req.json()

	let result

	try {
		result = await db.insert(interest).values({
			email,
			evmWallet,
			interestId
		}).returning()

		return NextResponse.json({
			status: 201,
			data: {
				msg: "Successful in creating interest.",
				result: result[0]
			}
		})
	} catch {
		return NextResponse.json({
			status: 500,
			data: {
				msg: "Failed to create interest",
				result
			}
		})
	}
}