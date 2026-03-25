export type Route = {
	pickup: string;
	destination: string;
	departureDate?: string;
	departureTime?: string;
	flightNumber?: string;
};

export const STATUS_COLORS: Record<string, string> = {
	PENDING: "bg-yellow-500",
	QUOTED: "bg-blue-500",
	ACCEPTED: "bg-green-500",
	CONFIRMED: "bg-emerald-600",
	REJECTED: "bg-red-500",
	COMPLETED: "bg-gray-500",
	CANCELLED: "bg-gray-400",
};

export const QUOTATION_STATUS_COLORS: Record<string, string> = {
	PENDING: "bg-blue-500",
	ACCEPTED: "bg-green-500",
	REJECTED: "bg-red-500",
};

export function parseRoutes(json: string): Route[] {
	try {
		const parsed = JSON.parse(json);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

// Accepts any t() function that covers the status keys — works with all namespaces
// that define statusPending, statusQuoted, etc.
export function buildStatusLabels(
	t: (key: string) => string,
): Record<string, string> {
	return {
		PENDING: t("statusPending"),
		QUOTED: t("statusQuoted"),
		ACCEPTED: t("statusAccepted"),
		CONFIRMED: t("statusConfirmed"),
		REJECTED: t("statusRejected"),
		COMPLETED: t("statusCompleted"),
		CANCELLED: t("statusCancelled"),
	};
}
