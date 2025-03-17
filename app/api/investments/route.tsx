import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { investment } from "@/db/schema"

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const id = searchParams.get("id")
	
	let result
  
	try {
		if (id) {
			result = await db.select().from(investment).where(eq(investment.id, Number(id)))
	  
			if (result.length === 0) {
				return NextResponse.json({
					status: 200,
					data: {
						msg: "Investment not found",
						result: []
					}
				})
			}
		} else {
			result = await db.select().from(investment)
		}
		
		return NextResponse.json({
			status: 200,
			data: {
				msg: "Successful in fetching investments",
				result
			}
		})
	} catch {
		return NextResponse.json({
			status: 500,
			data: {
				msg: "Failed to fetch investments",
				result
			}
		})
	}
}

export async function POST(req: NextRequest) {
	const {
		title,
		category,
		location,
		country,
		structure,
		author,
		chain,
		stage,
		yields,
		period,
		claim,
		frequency,
		contract,
		keywords,
		content,
		images,
		minimum,
		maximum
	} = await req.json()

	let result

	try {
		result = await db.insert(investment).values({
			title,
			category,
			location,
			country,
			structure,
			author,
			chain,
			stage,
			yields,
			period,
			claim,
			frequency,
			contract,
			keywords,
			content,
			images,
			minimum,
			maximum
		}).returning()

		return NextResponse.json({
			status: 201,
			data: {
				msg: "Successful in creating investment",
				result: result[0]
			}
		})
	} catch {
		return NextResponse.json({
			status: 500,
			data: {
				msg: "Failed to create investment",
				result
			}
		})
	}
}
