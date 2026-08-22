export type RouteCalendarInfo = {
	routeType?: string | null;
	pickup: string;
	destination: string;
	scheduledDate?: string | null;
	scheduledTime?: string | null;
	flightNumber?: string | null;
};

export type TripCalendarInfo = {
	orderNumber?: number | null;
	firstName?: string | null;
	lastName?: string | null;
	numberOfAdults?: number | null;
	numberOfChildren?: number | null;
	additionalInfo?: string | null;
	quotations?: Array<{
		status: string;
		price: { toString(): string };
		currency: string;
		isPriceEachWay: boolean;
		quotationAdditionalInfo?: string | null;
	}>;
};

export function buildCalendarEvent({
	routeType,
	pickup,
	destination,
	flightNumber,
	tripInfo,
	driverName,
	driverPhone,
	meetingPoint,
}: {
	routeType?: string | null;
	pickup: string;
	destination: string;
	flightNumber?: string | null;
	tripInfo?: TripCalendarInfo;
	driverName?: string;
	driverPhone?: string | null;
	meetingPoint?: string | null;
}): { summary: string; description: string } {
	const pickupLabel =
		routeType === "airport_in" ? `Airport of: ${pickup}` : pickup;
	const destinationLabel =
		routeType === "airport_out" ? `Airport of: ${destination}` : destination;
	const {
		orderNumber,
		firstName,
		lastName,
		numberOfAdults,
		numberOfChildren,
		additionalInfo,
		quotations,
	} = tripInfo ?? {};
	const accepted = quotations?.find((q) => q.status === "ACCEPTED");
	const total = (numberOfAdults ?? 0) + (numberOfChildren ?? 0);
	const requestId = orderNumber
		? `#${String(orderNumber).padStart(7, "0")}`
		: null;
	const summary = `${pickupLabel} → ${destinationLabel}${flightNumber ? ` · ${flightNumber}` : ""}${total > 0 ? ` (${total} people)` : ""}${accepted ? ` (${accepted.price.toString()} ${accepted.currency})` : ""}`;
	const tripInfoLines = [
		requestId && `Request: ${requestId}`,
		firstName && lastName && `Client: ${firstName} ${lastName}`,
		numberOfAdults && `Adults: ${numberOfAdults}`,
		numberOfChildren && `Children: ${numberOfChildren}`,
		flightNumber && `Flight: ${flightNumber}`,
		additionalInfo && `Notes: ${additionalInfo}`,
	].filter(Boolean);

	const pickupLines = [
		driverName && `Driver: ${driverName}`,
		driverPhone && `Phone: ${driverPhone}`,
		meetingPoint && `Meeting point: ${meetingPoint}`,
	].filter(Boolean);

	const quotationLines = [
		accepted &&
			`Price: ${accepted.price.toString()} ${accepted.currency}${accepted.isPriceEachWay ? " (each way)" : ""}`,
		accepted?.quotationAdditionalInfo &&
			`Notes: ${accepted.quotationAdditionalInfo}`,
	].filter(Boolean);

	const sections = [
		tripInfoLines.length > 0 && `TRIP INFO\n${tripInfoLines.join("\n")}`,
		pickupLines.length > 0 && `PICKUP POINT\n${pickupLines.join("\n")}`,
		quotationLines.length > 0 && `QUOTATION\n${quotationLines.join("\n")}`,
	].filter(Boolean);

	const description = sections.join("\n\n");
	return { summary, description };
}

export function toICSDateTime(date: Date, timeStr?: string | null): string {
	const d = new Date(date);
	if (timeStr) {
		const [h, m] = timeStr.split(":").map(Number);
		d.setHours(h ?? 0, m ?? 0, 0, 0);
	}
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

export function googleCalendarUrl(params: {
	summary: string;
	description: string;
	location: string;
	start: string;
	end: string;
}): string {
	const p = new URLSearchParams({
		action: "TEMPLATE",
		text: params.summary,
		details: params.description,
		location: params.location,
		dates: `${params.start}/${params.end}`,
	});
	return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
