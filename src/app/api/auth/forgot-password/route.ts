import { db } from "@/server/db";
import { APP_URL, sendEmail } from "@/server/email";
import { GenericEmail } from "@/emails/generic-email";
import { createElement } from "react";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export async function POST(request: Request) {
	try {
		const { email } = (await request.json()) as { email: string };

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		const user = await db.user.findUnique({
			where: { email },
			select: { id: true, password: true },
		});

		// Always return success to avoid email enumeration
		if (!user?.password) {
			return NextResponse.json({ success: true });
		}

		// Delete any existing reset tokens for this email
		await db.passwordResetToken.deleteMany({ where: { email } });

		const token = randomBytes(32).toString("hex");
		const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

		await db.passwordResetToken.create({
			data: { email, token, expires },
		});

		const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

		await sendEmail({
			to: email,
			subject: "RESET YOUR PASSWORD",
			react: createElement(GenericEmail, {
				data: {
					preview: "Reset your password",
					title: "Reset your password",
					subtitle:
						"You requested a password reset. Click the button below to choose a new password. The link expires in 1 hour.",
					buttonLabel: "Reset Password",
					secondaryText:
						"If you didn't request this, you can safely ignore this email.",
				},
				href: resetUrl,
			}),
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[FORGOT_PASSWORD]", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 },
		);
	}
}
