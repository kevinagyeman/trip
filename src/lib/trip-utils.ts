export const STATUS_COLORS: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
	QUOTED: "bg-blue-100 text-blue-800 border-blue-200",
	ACCEPTED: "bg-green-100 text-green-800 border-green-200",
	CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
	REJECTED: "bg-red-100 text-red-800 border-red-200",
	COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
	CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export const QUOTATION_STATUS_COLORS: Record<string, string> = {
	PENDING: "text-blue-500",
	ACCEPTED: "text-green-500",
	REJECTED: "text-red-500",
};

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
