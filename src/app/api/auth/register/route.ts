import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email, password, name } = body;

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

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await db.user.create({
			data: {
				email,
				password: hashedPassword,
				name: name || null,
				role: "USER",
			},
		});

		// Generate verification token
		const verificationToken = await db.verificationToken.create({
			data: {
				identifier: email,
				token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
				expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			},
		});

		// TODO: Send verification email
		// For now, we'll just return the token in development
		// In production, you would send this via email

		return NextResponse.json(
			{
				message: "Registration successful. Please check your email to verify your account.",
				userId: user.id,
				// Remove this in production - only for development
				verificationToken: verificationToken.token,
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
