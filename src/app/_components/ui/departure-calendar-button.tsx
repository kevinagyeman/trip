"use client";

import { Button } from "@/components/ui/button";
import {
	buildCalendarEvent,
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
				const { summary, description } = buildCalendarEvent({
					routeType,
					pickup,
					destination,
					flightNumber,
					tripInfo,
				});
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
