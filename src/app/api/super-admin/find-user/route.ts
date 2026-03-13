import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { APP_URL, sendEmail } from "@/server/email";
import { GenericEmail } from "@/emails/generic-email";
import { createElement } from "react";
import { randomBytes } from "node:crypto";

export async function POST(request: Request) {
	const session = await auth();

	if (!session?.user || session.user.role !== "SUPER_ADMIN") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { email, companyName, companyId } = (await request.json()) as {
		email: string;
		companyName: string;
		companyId: string;
	};

	if (!email) {
		return NextResponse.json({ error: "Email is required" }, { status: 400 });
	}

	const user = await db.user.findUnique({
		where: { email },
		select: { id: true, name: true, email: true, role: true, companyId: true },
	});

	if (user) {
		if (user.companyId && user.companyId !== companyId) {
			return NextResponse.json(
				{
					error:
						"This user is already assigned to another company. Remove them from that company first.",
				},
				{ status: 409 },
			);
		}
		return NextResponse.json({ ...user, created: false });
	}

	// User doesn't exist — create them and send an invite
	const newUser = await db.user.create({
		data: { email, role: "USER" },
		select: { id: true, name: true, email: true, role: true, companyId: true },
	});

	// Create a 24-hour password-set token
	await db.passwordResetToken.deleteMany({ where: { email } });
	const token = randomBytes(32).toString("hex");
	await db.passwordResetToken.create({
		data: { email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
	});

	const setPasswordUrl = `${APP_URL}/auth/reset-password?token=${token}`;

	await sendEmail({
		to: email,
		subject: `[${companyName}] ADMIN INVITATION`,
		react: createElement(GenericEmail, {
			data: {
				preview: "Set your password",
				title: "You've been invited",
				subtitle: `You've been added as an admin for ${companyName} on dantrip.com. Click the button below to set your password and get started.`,
				buttonLabel: "Set Password",
				secondaryText:
					"This link expires in 24 hours. If you weren't expecting this invitation, you can safely ignore this email.",
			},
			href: setPasswordUrl,
		}),
	});

	return NextResponse.json({ ...newUser, created: true });
}
