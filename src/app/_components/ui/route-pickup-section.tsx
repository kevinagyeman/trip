"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { googleCalendarUrl, toICSDateTime } from "@/lib/calendar";
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
}: Props) {
	const t = useTranslations("common");

	const hasData = !!(meetingPoint ?? beThereAtDate ?? driverName);

	// Admin: flat display, no banner
	if (isAdmin) {
		return (
			<div className="px-3 py-3 space-y-1.5 text-base">
				<PickupReadOnlyView
					meetingPoint={meetingPoint}
					beThereAtDate={beThereAtDate}
					beThereAtTime={beThereAtTime}
					driverName={driverName}
					driverPhone={driverPhone}
					additionalInfo={additionalInfo}
					t={t}
				/>
			</div>
		);
	}

	// Customer: no data yet
	if (!hasData) {
		return (
			// <div className="px-3 py-3">
			// 	<AlertBanner
			// 		variant="info"
			// 		title={t("pickupScheduled")}
			// 		description={
			// 			<>
			// 				{t("pickupTimeNote")}
			// 				<br />
			// 				{t("noPickupData")}
			// 			</>
			// 		}
			// 	/>
			// </div>
			null
		);
	}

	// Customer: data present
	return (
		<div className="px-3 py-3 space-y-1.5 text-base">
			<AlertBanner
				variant="success"
				title={t("pickupConfirmedTitle")}
				description={t("pickupConfirmedDescription")}
			>
				<PickupReadOnlyView
					meetingPoint={meetingPoint}
					beThereAtDate={beThereAtDate}
					beThereAtTime={beThereAtTime}
					driverName={driverName}
					driverPhone={driverPhone}
					additionalInfo={additionalInfo}
					t={t}
				/>
				{beThereAtDate && (
					<div className="pt-1">
						<AddToCalendarButton
							pickup={pickup}
							destination={destination}
							driverName={driverName ?? ""}
							driverPhone={driverPhone}
							meetingPoint={meetingPoint}
							beThereAtDate={beThereAtDate}
							beThereAtTime={beThereAtTime}
							t={t}
						/>
					</div>
				)}
			</AlertBanner>
		</div>
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
		<>
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
				<InfoRow
					label={t("pickupInfoDriverPhone")}
					value={
						// <a href={`tel:${driverPhone}`} className="underline">
						// 	{driverPhone}
						// </a>
						driverPhone
					}
				/>
			)}
			{additionalInfo && (
				<InfoRow label={t("pickupInfoAdditionalInfo")} value={additionalInfo} />
			)}
		</>
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
	t,
}: {
	pickup: string;
	destination: string;
	driverName: string;
	driverPhone?: string | null;
	meetingPoint?: string | null;
	beThereAtDate: string;
	beThereAtTime?: string | null;
	t: ReturnType<typeof useTranslations>;
}) {
	return (
		<Button
			size="sm"
			variant="outline"
			onClick={() => {
				const date = new Date(beThereAtDate);
				const timeStr = beThereAtTime ?? "00:00";
				const [h, m] = timeStr.split(":").map(Number);
				const end = new Date(date);
				end.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
				window.open(
					googleCalendarUrl({
						summary: `${pickup} → ${destination}`,
						description: [
							driverName && `Driver: ${driverName}`,
							driverPhone && `Phone: ${driverPhone}`,
						]
							.filter(Boolean)
							.join("\n"),
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
