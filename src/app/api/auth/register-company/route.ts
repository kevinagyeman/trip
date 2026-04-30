import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sendEmail, APP_URL } from "@/server/email";
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

		const {
			companyName,
			slug,
			vat,
			address,
			country,
			website,
			fullName,
			email,
			password,
		} = parsed.data;

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
				address,
				country,
				website: website || null,
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
				name: fullName,
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

		// Notify super admin of new company registration
		const superAdmin = await db.user.findFirst({
			where: { role: "SUPER_ADMIN" },
			select: { email: true },
		});
		if (superAdmin?.email) {
			void sendEmail({
				to: superAdmin.email,
				subject: "New company registered",
				react: createElement(GenericEmail, {
					href: `${APP_URL}/super-admin`,
					data: {
						preview: "New company registered",
						title: "New company registered",
						buttonLabel: "View Dashboard",
					},
				}),
			});
		}

		// Send verification email
		const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
		await sendEmail({
			to: email,
			subject: "Verify your email – dantrip.com",
			react: createElement(GenericEmail, {
				href: verifyUrl,
				data: {
					preview: "Verify your email address",
					title: `Hi ${fullName}, please verify your email`,
					subtitle:
						"Click the button below to verify your email address. The link expires in 24 hours.",
					buttonLabel: "Verify Email",
				},
			}),
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[REGISTER_COMPANY]", JSON.stringify(error, null, 2));
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 },
		);
	}
}
