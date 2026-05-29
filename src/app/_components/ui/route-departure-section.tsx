"use client";

import { Button } from "@/components/ui/button";
import {
	googleCalendarUrl,
	toICSDateTime,
	type TripCalendarInfo,
} from "@/lib/calendar";
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
				<AddToCalendarButton
					routeType={routeType}
					pickup={pickup}
					destination={destination}
					scheduledDate={scheduledDate}
					scheduledTime={scheduledTime}
					flightNumber={flightNumber}
					tripInfo={tripInfo}
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
	routeType,
	pickup,
	destination,
	scheduledDate,
	scheduledTime,
	flightNumber,
	tripInfo,
	t,
}: {
	routeType?: string | null;
	pickup: string;
	destination: string;
	scheduledDate: string;
	scheduledTime?: string | null;
	flightNumber?: string | null;
	tripInfo?: TripCalendarInfo;
	t: ReturnType<typeof useTranslations>;
}) {
	return (
		<Button
			size="xs"
			variant="outline"
			onClick={() => {
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
				const summary = `${isAirport ? "APT: " : ""}${pickup} → ${destination}${total > 0 ? ` (${total})` : ""}`;
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
