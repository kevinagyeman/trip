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

export function PickupCalendarButton({
	route,
	driverName,
	driverPhone,
	meetingPoint,
	tripInfo,
	inBanner = false,
}: {
	route: RouteCalendarInfo & {
		beThereAtDate: string;
		beThereAtTime?: string | null;
	};
	driverName: string;
	driverPhone?: string | null;
	meetingPoint?: string | null;
	tripInfo?: TripCalendarInfo;
	inBanner?: boolean;
}) {
	const t = useTranslations("common");
	return (
		<Button
			size="xs"
			variant={inBanner ? "success" : "outline"}
			onClick={() => {
				const {
					routeType,
					pickup,
					destination,
					beThereAtDate,
					beThereAtTime,
					flightNumber,
				} = route;
				const date = new Date(beThereAtDate);
				const timeStr = beThereAtTime ?? "00:00";
				const [h, m] = timeStr.split(":").map(Number);
				const end = new Date(date);
				end.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
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
					driverName && `Driver: ${driverName}`,
					driverPhone && `Phone: ${driverPhone}`,
					meetingPoint && `Meeting point: ${meetingPoint}`,
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
						location: meetingPoint ?? pickup,
						start: toICSDateTime(date, timeStr),
						end: toICSDateTime(end),
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
