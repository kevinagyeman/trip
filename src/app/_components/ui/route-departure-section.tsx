"use client";

import { CopyFlightButton } from "@/app/_components/ui/copy-flight-button";
import { DepartureCalendarButton } from "@/app/_components/ui/departure-calendar-button";
import type { TripCalendarInfo } from "@/lib/calendar";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface Props {
	routeType?: string | null;
	scheduledDate?: string | null;
	scheduledTime?: string | null;
	flightNumber?: string | null;
	pickup?: string;
	destination?: string;
	showCalendar?: boolean;
	showCopyFlight?: boolean;
	tripInfo?: TripCalendarInfo;
}

export function RouteDepartureSection({
	routeType,
	scheduledDate,
	scheduledTime,
	flightNumber,
	pickup,
	destination,
	showCalendar = false,
	showCopyFlight = false,
	tripInfo,
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
			<div className="text-base">
				<span className="text-muted-foreground">{depLabel} —</span>
			</div>
		);
	}

	return (
		<div className="space-y-3 text-base">
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-muted-foreground">{depLabel} </span>

					{scheduledDate && (
						<span>{format(new Date(scheduledDate), "d MMM yyyy")}</span>
					)}

					{scheduledTime && <span>{scheduledTime}</span>}

					{flightNumber && !showCopyFlight && <span>{flightNumber}</span>}
					{showCopyFlight && flightNumber && (
						<CopyFlightButton flightNumber={flightNumber} />
					)}
				</div>
			</div>
			{showCalendar && scheduledDate && pickup && destination && (
				<DepartureCalendarButton
					route={{
						routeType,
						pickup,
						destination,
						scheduledDate,
						scheduledTime,
						flightNumber,
					}}
					tripInfo={tripInfo}
				/>
			)}
		</div>
	);
}
