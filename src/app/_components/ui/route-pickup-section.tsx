"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import {
	googleCalendarUrl,
	toICSDateTime,
	type TripCalendarInfo,
} from "@/lib/calendar";
import { format } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
	pickup: string;
	destination: string;
	driverName?: string | null;
	driverPhone?: string | null;
	beThereAtDate?: string | null;
	beThereAtTime?: string | null;
	meetingPoint?: string | null;
	additionalInfo?: string | null;
	isAdmin?: boolean;
	inBanner?: boolean;
	disabled?: boolean;
	routeType?: string | null;
	flightNumber?: string | null;
	tripInfo?: TripCalendarInfo;
}

export function RoutePickupSection({
	pickup,
	destination,
	driverName,
	driverPhone,
	beThereAtDate,
	beThereAtTime,
	meetingPoint,
	additionalInfo,
	isAdmin = false,
	inBanner = false,
	disabled = false,
	routeType,
	flightNumber,
	tripInfo,
}: Props) {
	const t = useTranslations("common");

	const hasData = !!(meetingPoint ?? beThereAtDate ?? driverName);

	// Admin: flat display, no banner
	if (isAdmin) {
		return (
			<div className="text-base space-y-3">
				<PickupReadOnlyView
					meetingPoint={meetingPoint}
					beThereAtDate={beThereAtDate}
					beThereAtTime={beThereAtTime}
					driverName={driverName}
					driverPhone={driverPhone}
					additionalInfo={additionalInfo}
					t={t}
				/>
				{!disabled && beThereAtDate && (
					<AddToCalendarButton
						pickup={pickup}
						destination={destination}
						driverName={driverName ?? ""}
						driverPhone={driverPhone}
						meetingPoint={meetingPoint}
						beThereAtDate={beThereAtDate}
						beThereAtTime={beThereAtTime}
						routeType={routeType}
						flightNumber={flightNumber}
						tripInfo={tripInfo}
						t={t}
					/>
				)}
			</div>
		);
	}

	// Customer: no data yet
	if (!hasData) {
		return null;
	}

	// Customer: data present
	return (
		<AlertBanner
			variant="success"
			title={t("pickupConfirmedTitle")}
			description={t("pickupConfirmedDescription")}
		>
			<div className="space-y-3">
				<PickupReadOnlyView
					meetingPoint={meetingPoint}
					beThereAtDate={beThereAtDate}
					beThereAtTime={beThereAtTime}
					driverName={driverName}
					driverPhone={driverPhone}
					additionalInfo={additionalInfo}
					t={t}
				/>
				{!disabled && beThereAtDate && (
					<AddToCalendarButton
						pickup={pickup}
						destination={destination}
						driverName={driverName ?? ""}
						driverPhone={driverPhone}
						meetingPoint={meetingPoint}
						beThereAtDate={beThereAtDate}
						beThereAtTime={beThereAtTime}
						routeType={routeType}
						flightNumber={flightNumber}
						tripInfo={tripInfo}
						t={t}
						inBanner={inBanner}
					/>
				)}
			</div>
		</AlertBanner>
	);
}

function PickupReadOnlyView({
	meetingPoint,
	beThereAtDate,
	beThereAtTime,
	driverName,
	driverPhone,
	additionalInfo,
	t,
}: {
	meetingPoint?: string | null;
	beThereAtDate?: string | null;
	beThereAtTime?: string | null;
	driverName?: string | null;
	driverPhone?: string | null;
	additionalInfo?: string | null;
	t: ReturnType<typeof useTranslations>;
}) {
	return (
		<div>
			{meetingPoint && (
				<InfoRow label={t("pickupInfoMeetingPoint")} value={meetingPoint} />
			)}
			{(beThereAtDate ?? beThereAtTime) && (
				<InfoRow
					label={t("pickupInfoBeThereAt")}
					value={
						<>
							{beThereAtDate && format(new Date(beThereAtDate), "d MMM yyyy")}
							{beThereAtDate && beThereAtTime && " - "}
							{beThereAtTime}
						</>
					}
				/>
			)}
			{driverName && (
				<InfoRow label={t("pickupInfoDriverName")} value={driverName} />
			)}
			{driverPhone && (
				<InfoRow label={t("pickupInfoDriverPhone")} value={driverPhone} />
			)}
			{additionalInfo && (
				<InfoRow label={t("pickupInfoAdditionalInfo")} value={additionalInfo} />
			)}
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<p>
			<span className="text-muted-foreground">{label}: </span>
			<span>{value}</span>
		</p>
	);
}

function AddToCalendarButton({
	pickup,
	destination,
	driverName,
	driverPhone,
	meetingPoint,
	beThereAtDate,
	beThereAtTime,
	routeType,
	flightNumber,
	tripInfo,
	t,
	inBanner = false,
}: {
	pickup: string;
	destination: string;
	driverName: string;
	driverPhone?: string | null;
	meetingPoint?: string | null;
	beThereAtDate: string;
	beThereAtTime?: string | null;
	routeType?: string | null;
	flightNumber?: string | null;
	tripInfo?: TripCalendarInfo;
	t: ReturnType<typeof useTranslations>;
	inBanner?: boolean;
}) {
	return (
		<Button
			size="xs"
			variant={inBanner ? "success" : "outline"}
			onClick={() => {
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
				const summary = `${isAirport ? "APT: " : ""}${pickup} → ${destination}${total > 0 ? ` (${total})` : ""}`;
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
