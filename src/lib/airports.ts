export type Airport = { iata: string; name: string };

export const ITALIAN_AIRPORTS: Airport[] = [
	{ iata: "MXP", name: "Milano Malpensa" },
	{ iata: "LIN", name: "Milano Linate" },
	{ iata: "BGY", name: "Milano Bergamo Orio al Serio" },
	{ iata: "FCO", name: "Roma Fiumicino Leonardo da Vinci" },
	{ iata: "CIA", name: "Roma Ciampino" },
	{ iata: "VCE", name: "Venezia Marco Polo" },
	{ iata: "TSF", name: "Treviso Sant'Angelo" },
	{ iata: "VRN", name: "Verona Villafranca Valerio Catullo" },
	{ iata: "BLQ", name: "Bologna Guglielmo Marconi" },
	{ iata: "FLR", name: "Firenze Amerigo Vespucci" },
	{ iata: "PSA", name: "Pisa Galileo Galilei" },
	{ iata: "NAP", name: "Napoli Capodichino" },
	{ iata: "BRI", name: "Bari Karol Wojtyla" },
	{ iata: "CTA", name: "Catania Fontanarossa" },
	{ iata: "PMO", name: "Palermo Falcone Borsellino" },
	{ iata: "TRN", name: "Torino Caselle" },
	{ iata: "GOA", name: "Genova Cristoforo Colombo" },
	{ iata: "TRS", name: "Trieste" },
	{ iata: "AOI", name: "Ancona Falconara" },
	{ iata: "REG", name: "Reggio Calabria" },
	{ iata: "SUF", name: "Lamezia Terme" },
	{ iata: "BDS", name: "Brindisi Papola Casale" },
	{ iata: "OLB", name: "Olbia Costa Smeralda" },
	{ iata: "CAG", name: "Cagliari Elmas" },
	{ iata: "PMF", name: "Parma Giuseppe Verdi" },
	{ iata: "RMI", name: "Rimini Federico Fellini" },
];

export function formatAirport(a: Airport): string {
	return `${a.iata} - ${a.name}`;
}

export function parseAirports(json: string | null | undefined): string[] {
	if (!json) return [];
	try {
		const parsed = JSON.parse(json);
		return Array.isArray(parsed) ? (parsed as string[]) : [];
	} catch {
		return [];
	}
}
