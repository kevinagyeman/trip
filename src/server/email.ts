import { Resend } from "resend";
import { env } from "@/env";
import { db } from "@/server/db";
import type { ReactElement } from "react";

const resend = new Resend(env.RESEND_API_KEY);

export const FROM_EMAIL = env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export const ADMIN_EMAIL = env.ADMIN_EMAIL ?? "";

export const APP_URL = env.APP_URL ?? "http://localhost:3000";

/**
 * Resolves all admin notification emails for a given company.
 * - If the request belongs to a company, returns emails of ALL ADMIN users of that company.
 * - If no company (or no admin users found), falls back to the global ADMIN_EMAIL env var.
 */
export async function resolveAdminEmails(
	companyId: string | null | undefined,
): Promise<string[]> {
	const users = await resolveAdminUsers(companyId);
	return users.map((u) => u.email);
}

export async function resolveAdminUsers(
	companyId: string | null | undefined,
): Promise<{ email: string; preferredLanguage: string }[]> {
	if (companyId) {
		const adminUsers = await db.user.findMany({
			where: { companyId, role: "ADMIN" },
			select: { email: true, preferredLanguage: true },
		});
		const users = adminUsers.filter(
			(u): u is { email: string; preferredLanguage: string } => !!u.email,
		);
		if (users.length > 0) return users;
	}
	return ADMIN_EMAIL ? [{ email: ADMIN_EMAIL, preferredLanguage: "en" }] : [];
}

export async function resolveCompanyName(
	companyId: string | null | undefined,
): Promise<string | null> {
	if (!companyId) return null;
	const company = await db.company.findUnique({
		where: { id: companyId },
		select: { name: true },
	});
	return company?.name ?? null;
}

export async function sendEmail({
	to,
	subject,
	react,
}: {
	to: string;
	subject: string;
	react: ReactElement;
}): Promise<boolean> {
	try {
		await resend.emails.send({ from: FROM_EMAIL, to, subject, react });
		return true;
	} catch (error) {
		console.error(`[EMAIL] Failed to send "${subject}" to ${to}:`, error);
		return false;
	}
}
