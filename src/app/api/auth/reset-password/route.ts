import { db } from "@/server/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
	try {
		const { token, password } = (await request.json()) as {
			token: string;
			password: string;
		};

		if (!token || !password) {
			return NextResponse.json(
				{ error: "Token and password are required" },
				{ status: 400 },
			);
		}

		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters" },
				{ status: 400 },
			);
		}

		const resetToken = await db.passwordResetToken.findUnique({
			where: { token },
		});

		if (!resetToken) {
			return NextResponse.json(
				{ error: "Invalid or expired reset link" },
				{ status: 400 },
			);
		}

		if (resetToken.expires < new Date()) {
			await db.passwordResetToken.delete({ where: { token } });
			return NextResponse.json(
				{ error: "Reset link has expired. Please request a new one." },
				{ status: 400 },
			);
		}

		const hashed = await bcrypt.hash(password, 10);

		await db.user.update({
			where: { email: resetToken.email },
			data: { password: hashed },
		});

		await db.passwordResetToken.delete({ where: { token } });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[RESET_PASSWORD]", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 },
		);
	}
}
