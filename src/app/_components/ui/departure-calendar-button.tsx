"use client";

import { Button } from "@/components/ui/button";
import {
	googleCalendarUrl,
	toICSDateTime,
	type RouteCalendarInfo,
	type TripCalendarInfo,
} from "@/lib/calendar";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";

export function DepartureCalendarButton({
	route,
	tripInfo,
}: {
	route: RouteCalendarInfo & { scheduledDate: string };
	tripInfo?: TripCalendarInfo;
}) {
	const t = useTranslations("common");
	return (
		<Button
			size="xs"
			variant="outline"
			onClick={() => {
				const {
					routeType,
					pickup,
					destination,
					scheduledDate,
					scheduledTime,
					flightNumber,
				} = route;
				const [hRaw, mRaw] = (scheduledTime ?? "00:00").split(":").map(Number);
				const endH = ((hRaw ?? 0) + 1) % 24;
				const isAirport =
					routeType === "airport_in" || routeType === "airport_out";
				const {
					firstName,
					lastName,
					numberOfAdults,
					numberOfChildren,
					quotations,
				} = tripInfo ?? {};
				const accepted = quotations?.find((q) => q.status === "ACCEPTED");
				const total = (numberOfAdults ?? 0) + (numberOfChildren ?? 0);
				const summary = `${isAirport ? "APT: " : ""}${pickup} → ${destination}${flightNumber ? ` · ${flightNumber}` : ""}${total > 0 ? ` (${total} people)` : ""}${accepted ? ` (${accepted.price.toString()} ${accepted.currency})` : ""}`;
				const description = [
					firstName && lastName && `Client: ${firstName} ${lastName}`,
					numberOfAdults &&
						`Passengers: ${numberOfAdults} adult${numberOfAdults > 1 ? "s" : ""}${numberOfChildren ? `, ${numberOfChildren} child${numberOfChildren > 1 ? "ren" : ""}` : ""}`,
					flightNumber && `Flight: ${flightNumber}`,
					accepted &&
						`Price: ${accepted.price.toString()} ${accepted.currency}${accepted.isPriceEachWay ? " (each way)" : ""}`,
					accepted?.quotationAdditionalInfo &&
						`Notes: ${accepted.quotationAdditionalInfo}`,
				]
					.filter(Boolean)
					.join("\n");
				window.open(
					googleCalendarUrl({
						summary,
						description,
						location: pickup,
						start: toICSDateTime(new Date(scheduledDate), scheduledTime),
						end: toICSDateTime(
							new Date(scheduledDate),
							`${String(endH).padStart(2, "0")}:${String(mRaw ?? 0).padStart(2, "0")}`,
						),
					}),
					"_blank",
				);
			}}
		>
			<CalendarPlus />
			{t("googleCalendar")}
		</Button>
	);
}
