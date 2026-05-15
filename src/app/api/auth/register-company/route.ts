import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sendEmail, ADMIN_EMAIL, APP_URL } from "@/server/email";
import { registerCompanySchema } from "@/lib/schemas/auth";
import { GenericEmail } from "@/emails/generic-email";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { createElement } from "react";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = registerCompanySchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.errors[0]?.message ?? "Invalid input" },
				{ status: 400 },
			);
		}

		const { companyName, slug, vat, email, password } = parsed.data;

		const locale =
			typeof body.locale === "string" && ["en", "it"].includes(body.locale)
				? body.locale
				: "en";

		// Check slug uniqueness
		const existingCompany = await db.company.findUnique({ where: { slug } });
		if (existingCompany) {
			return NextResponse.json(
				{ error: "This slug is already taken. Please choose another." },
				{ status: 409 },
			);
		}

		// Check email uniqueness
		const existingUser = await db.user.findUnique({ where: { email } });
		if (existingUser) {
			return NextResponse.json(
				{ error: "An account with this email already exists." },
				{ status: 409 },
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		// Create company (inactive until email verified)
		const company = await db.company.create({
			data: {
				name: companyName,
				slug,
				vat,
				isActive: false,
				estimateNotice: JSON.stringify({
					en: "Please note that this is an estimate based on the information provided. The final price may vary depending on the departure time — night or early morning transfers may incur a surcharge.",
					it: "Ti informiamo che questo è un preventivo indicativo. Il prezzo finale potrebbe variare in base all'orario di partenza — i trasferimenti notturni o nelle prime ore del mattino potrebbero prevedere un supplemento.",
				}),
			},
		});

		// Create admin user (unverified)
		await db.user.create({
			data: {
				name: null,
				email,
				password: hashedPassword,
				role: "ADMIN",
				companyId: company.id,
				emailVerified: null,
				privacyAcceptedAt: new Date(),
				preferredLanguage: locale,
			},
		});

		// Create verification token (expires in 24h)
		const token = crypto.randomBytes(32).toString("hex");
		await db.verificationToken.create({
			data: {
				identifier: email,
				token,
				expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
			},
		});

		const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
		const superAdminUrl = `${APP_URL}/super-admin/companies/${company.id}`;

		await Promise.all([
			// Send verification email to new user
			sendEmail({
				to: email,
				subject: "Verify your email – dantrip.com",
				react: createElement(GenericEmail, {
					href: verifyUrl,
					data: {
						preview: "Verify your email address",
						title: "Please verify your email",
						subtitle:
							"Click the button below to verify your email address. The link expires in 24 hours.",
						buttonLabel: "Verify Email",
					},
				}),
			}),
			// Notify super admin of new registration
			ADMIN_EMAIL
				? sendEmail({
						to: ADMIN_EMAIL,
						subject: `New company registration: ${companyName}`,
						react: createElement(GenericEmail, {
							href: superAdminUrl,
							data: {
								preview: `New registration: ${companyName}`,
								title: "New company registration",
								subtitle: `${email} registered "${companyName}" (/${slug}). The company is inactive until you review and activate it.`,
								buttonLabel: "Review Company",
							},
						}),
					})
				: Promise.resolve(),
		]);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[REGISTER_COMPANY]", JSON.stringify(error, null, 2));
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 },
		);
	}
}
