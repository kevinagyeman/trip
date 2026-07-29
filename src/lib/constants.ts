const LOCALE_CODES = ["en", "it"] as const;

const WHATSAPP_TEMPLATES: Record<
	string,
	(firstName: string, company: string, orderNum: string, link: string) => string
> = {
	en: (firstName, company, orderNum, link) =>
		`Dear ${firstName}, we are ${company} and we are writing to you about your transfer request #${orderNum}.\n\nWe have updated your request, you can view it here:\n${link}\n\nPlease don't reply here — use the link above.`,
	it: (firstName, company, orderNum, link) =>
		`Gentile ${firstName}, siamo ${company} e la stiamo contattando riguardo alla Sua richiesta di trasferimento #${orderNum}.\nAbbiamo aggiornato la Sua richiesta, può visualizzarla qui:\n${link}\n\nLa preghiamo di non rispondere qui — utilizzi il link sopra.`,
};

export function buildWhatsAppMessage(
	language: string,
	firstName: string,
	company: string,
	orderNum: string,
	link: string,
): string {
	const tpl = WHATSAPP_TEMPLATES[language] ?? WHATSAPP_TEMPLATES.en;
	return tpl!(firstName, company, orderNum, link);
}

const QUOTATION_WHATSAPP_TEMPLATES: Record<
	string,
	(firstName: string, company: string, orderNum: string, link: string) => string
> = {
	en: (firstName, company, orderNum, link) =>
		`Dear ${firstName}, we are ${company}.\n\nThe quotation for your transfer request #${orderNum} is ready — you can view and accept it here:\n\n${link}\n\nPlease don't reply here — use the link above.`,
	it: (firstName, company, orderNum, link) =>
		`Gentile ${firstName}, siamo ${company}.\n\nIl preventivo per la Sua richiesta di trasferimento #${orderNum} è pronto — può visualizzarlo e accettarlo qui:\n\n${link}\n\nLa preghiamo di non rispondere qui — utilizzi il link sopra.`,
};

export function buildQuotationWhatsAppMessage(
	language: string,
	firstName: string,
	company: string,
	orderNum: string,
	link: string,
): string {
	const tpl =
		QUOTATION_WHATSAPP_TEMPLATES[language] ?? QUOTATION_WHATSAPP_TEMPLATES.en;
	return tpl!(firstName, company, orderNum, link);
}

export type Locale = (typeof LOCALE_CODES)[number];

export const LANGUAGES = LOCALE_CODES.map((code) => ({
	value: code,
	label: code,
}));

// Zod-compatible tuple: z.enum(LOCALE_ENUM)
export const LOCALE_ENUM = LOCALE_CODES as unknown as [Locale, ...Locale[]];

export const LANGUAGE_LABELS: Record<string, string> = Object.fromEntries(
	LOCALE_CODES.map((code) => [code, code]),
);
