export const QUICK_FILL = [
	{ value: "VRN", label: "VRN - Verona Villafranca" },
	{ value: "BGY", label: "BGY - Milano Bergamo" },
	{ value: "MXP", label: "MXP - Milano Malpensa" },
	{ value: "LIN", label: "LIN - Milano Linate" },
	{ value: "VCE", label: "VCE - Venezia Marco Polo" },
	{ value: "TSF", label: "TSF - Treviso Sant'Angelo" },
	{ value: "BLQ", label: "BLQ - Bologna Marconi" },
] as const;

export const LANGUAGES = [
	{ value: "en", label: "English" },
	{ value: "it", label: "Italian" },
] as const;

export const LANGUAGE_LABELS: Record<string, string> = Object.fromEntries(
	LANGUAGES.map((l) => [l.value, l.label]),
);
