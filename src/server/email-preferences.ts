import { db } from "@/server/db";

export interface EmailPreferences {
	newTripRequest: boolean;
	quotationAccepted: boolean;
	quotationRejected: boolean;
	customerMessage: boolean;
	tripDetailsUpdated: boolean;
}

export const EMAIL_PREFERENCE_DEFAULTS: EmailPreferences = {
	newTripRequest: true,
	quotationAccepted: true,
	quotationRejected: true,
	customerMessage: true,
	tripDetailsUpdated: true,
};

export async function getEmailPreferences(
	companyId: string | null | undefined,
): Promise<EmailPreferences> {
	if (!companyId) return EMAIL_PREFERENCE_DEFAULTS;

	const company = await db.company.findUnique({
		where: { id: companyId },
		select: { emailPreferences: true },
	});

	if (!company?.emailPreferences) return EMAIL_PREFERENCE_DEFAULTS;

	const stored = company.emailPreferences as Partial<EmailPreferences>;
	return { ...EMAIL_PREFERENCE_DEFAULTS, ...stored };
}

export async function isEmailEnabled(
	companyId: string | null | undefined,
	type: keyof EmailPreferences,
): Promise<boolean> {
	const prefs = await getEmailPreferences(companyId);
	return prefs[type];
}
