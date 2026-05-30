"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { PickupCalendarButton } from "@/app/_components/ui/pickup-calendar-button";
import { PickupReadOnlyView } from "@/app/_components/ui/pickup-readonly-view";
import type { TripCalendarInfo } from "@/lib/calendar";
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
					<PickupCalendarButton
						route={{
							routeType,
							pickup,
							destination,
							beThereAtDate,
							beThereAtTime,
							flightNumber,
						}}
						driverName={driverName ?? ""}
						driverPhone={driverPhone}
						meetingPoint={meetingPoint}
						tripInfo={tripInfo}
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
					<PickupCalendarButton
						route={{
							routeType,
							pickup,
							destination,
							beThereAtDate,
							beThereAtTime,
							flightNumber,
						}}
						driverName={driverName ?? ""}
						driverPhone={driverPhone}
						meetingPoint={meetingPoint}
						tripInfo={tripInfo}
						inBanner={inBanner}
					/>
				)}
			</div>
		</AlertBanner>
	);
}
