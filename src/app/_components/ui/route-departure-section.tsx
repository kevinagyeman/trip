"use client";

import { Button } from "@/components/ui/button";
import { googleCalendarUrl, toICSDateTime } from "@/lib/calendar";
import { format } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
	routeType?: string | null;
	scheduledDate?: string | null;
	scheduledTime?: string | null;
	flightNumber?: string | null;
	pickup?: string;
	destination?: string;
	showCalendar?: boolean;
}

export function RouteDepartureSection({
	routeType,
	scheduledDate,
	scheduledTime,
	flightNumber,
	pickup,
	destination,
	showCalendar = false,
}: Props) {
	const t = useTranslations("common");

	const depLabel =
		routeType === "airport_out"
			? t("departureScheduledTakeoff")
			: routeType === "airport_in"
				? t("departureScheduledLanding")
				: t("departureScheduledArrival");

	const hasData = !!(scheduledDate ?? scheduledTime ?? flightNumber);

	if (!hasData) {
		return (
			<div className="px-3 pt-3 text-base">
				<span className="text-muted-foreground">{depLabel}</span>{" "}
				<span className="text-muted-foreground">—</span>
			</div>
		);
	}

	return (
		<div className="px-3 py-2 space-y-1 text-base">
			<p>
				<span className="text-muted-foreground">{depLabel} </span>

				{scheduledDate && (
					<span>{format(new Date(scheduledDate), "d MMM yyyy")}</span>
				)}

				{scheduledTime && <span> - {scheduledTime}</span>}

				{flightNumber && <span> - {flightNumber}</span>}
				<span className="ml-4">
					{showCalendar && scheduledDate && pickup && destination && (
						<AddToCalendarButton
							pickup={pickup}
							destination={destination}
							scheduledDate={scheduledDate}
							scheduledTime={scheduledTime}
							flightNumber={flightNumber}
							t={t}
						/>
					)}
				</span>
			</p>
		</div>
	);
}

function AddToCalendarButton({
	pickup,
	destination,
	scheduledDate,
	scheduledTime,
	flightNumber,
	t,
}: {
	pickup: string;
	destination: string;
	scheduledDate: string;
	scheduledTime?: string | null;
	flightNumber?: string | null;
	t: ReturnType<typeof useTranslations>;
}) {
	return (
		<Button
			size="sm"
			variant="outline"
			onClick={() => {
				const [hRaw, mRaw] = (scheduledTime ?? "00:00").split(":").map(Number);
				const endH = ((hRaw ?? 0) + 1) % 24;
				window.open(
					googleCalendarUrl({
						summary: `${pickup} → ${destination}`,
						description: flightNumber ? `Flight: ${flightNumber}` : "",
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
