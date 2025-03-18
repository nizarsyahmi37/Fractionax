import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
	const headers = new Headers(request.headers)
	headers.set("x-current-path", request.nextUrl.pathname)
	headers.set("x-hostname", request.nextUrl.hostname)
	headers.set("Access-Control-Allow-Origin", "https://fractionax.app")
	headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	return NextResponse.next({ headers })
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
}