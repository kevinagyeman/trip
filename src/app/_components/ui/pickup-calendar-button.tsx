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
				const { summary, description } = buildCalendarEvent({
					routeType,
					pickup,
					destination,
					flightNumber,
					tripInfo,
					driverName,
					driverPhone,
					meetingPoint,
				});
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
