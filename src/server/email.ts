import { Resend } from "resend";
import { env } from "@/env";
import type { ReactElement } from "react";

const resend = new Resend(env.RESEND_API_KEY);

export const FROM_EMAIL = env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export const ADMIN_EMAIL = env.ADMIN_EMAIL ?? "";

export const APP_URL = env.APP_URL ?? "http://localhost:3000";

export async function sendEmail({
	to,
	subject,
	react,
}: {
	to: string;
	subject: string;
	react: ReactElement;
}) {
	try {
		await resend.emails.send({ from: FROM_EMAIL, to, subject, react });
	} catch (error) {
		console.error(`[EMAIL] Failed to send "${subject}" to ${to}:`, error);
	}
}
