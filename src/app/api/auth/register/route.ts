import { NextResponse } from "next/server";

// Registration via this endpoint is disabled.
// Customers book directly via /book/[slug] without creating an account.
// Admin accounts are created by a super admin via the admin panel.
export async function POST() {
	return NextResponse.json(
		{ error: "Registration is disabled" },
		{ status: 410 },
	);
}
