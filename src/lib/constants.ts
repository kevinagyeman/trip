const LOCALE_CODES = ["en", "it"] as const;

const WHATSAPP_TEMPLATES: Record<
	string,
	(company: string, orderNum: string, link: string) => string
> = {
	en: (company, orderNum, link) =>
		`We are ${company} and we are writing to you about your transfer request #${orderNum}.\nWe have updated your request, you can view it here:\n${link}`,
	it: (company, orderNum, link) =>
		`Siamo ${company} e la stiamo contattando riguardo alla Sua richiesta di trasferimento #${orderNum}.\nAbbiamo aggiornato la Sua richiesta, può visualizzarla qui:\n${link}`,
};

export function buildWhatsAppMessage(
	language: string,
	company: string,
	orderNum: string,
	link: string,
): string {
	const tpl = WHATSAPP_TEMPLATES[language] ?? WHATSAPP_TEMPLATES.en;
	return tpl!(company, orderNum, link);
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
