import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get("token");

		if (!token) {
			return NextResponse.json(
				{ error: "Verification token is required" },
				{ status: 400 },
			);
		}

		// Find the verification token
		const verificationToken = await db.verificationToken.findUnique({
			where: {
				token,
			},
		});

		if (!verificationToken) {
			return NextResponse.json(
				{ error: "Invalid verification token" },
				{ status: 400 },
			);
		}

		// Check if token has expired
		if (verificationToken.expires < new Date()) {
			// Delete expired token
			await db.verificationToken.delete({
				where: { token },
			});

			return NextResponse.json(
				{ error: "Verification token has expired" },
				{ status: 400 },
			);
		}

		// Find user by email
		const user = await db.user.findUnique({
			where: { email: verificationToken.identifier },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Update user's email verification status
		await db.user.update({
			where: { id: user.id },
			data: { emailVerified: new Date() },
		});

		// Delete the used verification token
		await db.verificationToken.delete({
			where: { token },
		});

		// Redirect to sign-in page with success message
		return NextResponse.redirect(
			new URL("/auth/signin?verified=true", request.url),
		);
	} catch (error) {
		console.error("Email verification error:", error);
		return NextResponse.json(
			{ error: "An error occurred during email verification" },
			{ status: 500 },
		);
	}
}
