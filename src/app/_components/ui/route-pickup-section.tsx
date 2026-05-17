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
	inBanner?: boolean;
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
				{beThereAtDate && (
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
				)}
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
				{beThereAtDate && (
					<AddToCalendarButton
						pickup={pickup}
						destination={destination}
						driverName={driverName ?? ""}
						driverPhone={driverPhone}
						meetingPoint={meetingPoint}
						beThereAtDate={beThereAtDate}
						beThereAtTime={beThereAtTime}
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
	t: ReturnType<typeof useTranslations>;
	inBanner?: boolean;
}) {
	return (
		<Button
			size="sm"
			variant={inBanner ? "success" : "outline"}
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
