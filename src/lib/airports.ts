export const AIRPORTS = [
	{ value: "VRN", label: "VRN - Verona Villafranca Valerio Catullo" },
	{ value: "BGY", label: "BGY - Milano Bergamo Orio al Serio" },
	{ value: "MXP", label: "MXP - Milano Malpensa" },
	{ value: "LIN", label: "MIL - Milano Linate" },
	{ value: "VCE", label: "VCE - Venezia Marcopolo" },
	{ value: "TSF", label: "TSF - Treviso Sant'Angelo" },
	{ value: "BLQ", label: "BLQ - Bologna Guglielmo Marconi" },
] as const;

export const SERVICE_TYPES = [
	{ value: "both", label: "Arrivo e Partenza" },
	{ value: "arrival", label: "Solo Arrivo" },
	{ value: "departure", label: "Solo Partenza" },
] as const;

export const LANGUAGES = [
	{ value: "English", label: "English" },
	{ value: "Italian", label: "Italian" },
] as const;
