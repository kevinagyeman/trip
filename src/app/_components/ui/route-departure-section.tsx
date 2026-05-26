"use client";

import { Button } from "@/components/ui/button";
import { googleCalendarUrl, toICSDateTime } from "@/lib/calendar";
import { format } from "date-fns";
import { CalendarPlus, Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
	routeType?: string | null;
	scheduledDate?: string | null;
	scheduledTime?: string | null;
	flightNumber?: string | null;
	pickup?: string;
	destination?: string;
	showCalendar?: boolean;
	showCopyFlight?: boolean;
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
				<AddToCalendarButton
					pickup={pickup}
					destination={destination}
					scheduledDate={scheduledDate}
					scheduledTime={scheduledTime}
					flightNumber={flightNumber}
					t={t}
				/>
			)}
		</div>
	);
}

function CopyFlightButton({ flightNumber }: { flightNumber: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		void navigator.clipboard.writeText(flightNumber).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	};

	return (
		<Button
			type="button"
			size="xs"
			variant={"outline"}
			onClick={handleCopy}
			title="Copy flight number"
			className="text-base font-normal"
		>
			{flightNumber}
			{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
		</Button>
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
			size="xs"
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
