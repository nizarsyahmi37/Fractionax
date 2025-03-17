import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { user } from "@/db/schema"

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const id = searchParams.get("id")
	
	let result
  
	try {
		if (id) {
			result = await db.select().from(user).where(eq(user.id, Number(id)))
	  
			if (result.length === 0) {
				return NextResponse.json({
					status: 200,
					data: {
						msg: "User not found",
						result: []
					}
				})
			}
		} else {
			result = await db.select().from(user)
		}
		
		return NextResponse.json({
			status: 200,
			data: {
				msg: "Successful in fetching users",
				result
			}
		})
	} catch {
		return NextResponse.json({
			status: 500,
			data: {
				msg: "Failed to fetch users",
				result
			}
		})
	}
}
