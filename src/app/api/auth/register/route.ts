import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createElement } from "react";
import { db } from "@/server/db";
import { sendEmail, APP_URL } from "@/server/email";
import { GenericEmail } from "@/emails/generic-email";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email, password, name, companySlug } = body;

		// Validate input
		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 },
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 },
			);
		}

		// Validate password strength
		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters long" },
				{ status: 400 },
			);
		}

		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 400 },
			);
		}

		// Company slug is required — users must register via /book/[slug]
		if (!companySlug) {
			return NextResponse.json(
				{ error: "Registration requires a company invitation link" },
				{ status: 400 },
			);
		}

		const company = await db.company.findUnique({
			where: { slug: companySlug, isActive: true },
		});
		if (!company) {
			return NextResponse.json(
				{ error: "Company not found or inactive" },
				{ status: 400 },
			);
		}
		const companyId = company.id;

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await db.user.create({
			data: {
				email,
				password: hashedPassword,
				name: name || null,
				role: "USER",
				companyId,
			},
		});

		// Generate verification token
		const verificationToken = await db.verificationToken.create({
			data: {
				identifier: email,
				token:
					Math.random().toString(36).substring(2, 15) +
					Math.random().toString(36).substring(2, 15),
				expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			},
		});

		// Send verification email
		const verificationUrl = `${APP_URL}/api/auth/verify-email?token=${verificationToken.token}`;
		await sendEmail({
			to: email,
			subject: "VERIFY YOUR ACCOUNT",
			react: createElement(GenericEmail, {
				data: {
					preview: "Verify your email address",
					title: `Hi${name ? ` ${name}` : ""}, verify your email address`,
					subtitle:
						"Thanks for signing up! Please verify your email address by clicking the button below. The link is valid for 24 hours.",
					buttonLabel: "Verify Email Address",
					secondaryText:
						"If you didn't create an account, you can safely ignore this email.",
				},
				href: verificationUrl,
			}),
		});

		return NextResponse.json(
			{
				message:
					"Registration successful. Please check your email to verify your account.",
				userId: user.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Registration error:", error);
		return NextResponse.json(
			{ error: "An error occurred during registration" },
			{ status: 500 },
		);
	}
}
