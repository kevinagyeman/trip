const LOCALE_CODES = ["en", "it"] as const;

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
