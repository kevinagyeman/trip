"use client";

import { AdminPickupEditDialog } from "@/app/_components/admin/admin-pickup-edit-dialog";
import type {
	Driver,
	RouteData,
} from "@/app/_components/admin/admin-pickup-edit-dialog";
import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { RoutePickupSection } from "@/app/_components/ui/route-pickup-section";
import type { TripCalendarInfo } from "@/lib/calendar";

interface Props {
	requestId: string;
	route: RouteData;
	routeIndex: number;
	allRoutes: RouteData[];
	drivers: Driver[];
	isLoading: boolean;
	onSave: Parameters<typeof AdminPickupEditDialog>[0]["onSave"];
	warningTitle: string;
	warningText: string;
	disabled?: boolean;
	tripInfo?: TripCalendarInfo;
}

export function PickupAdminBlock({
	requestId,
	route,
	routeIndex,
	allRoutes,
	drivers,
	isLoading,
	onSave,
	warningTitle,
	warningText,
	disabled = false,
	tripInfo,
}: Props) {
	const hasPickupData = !!(
		route.meetingPoint ??
		route.beThereAtDate ??
		route.driverName
	);

	if (!hasPickupData) {
		if (disabled) return null;
		return (
			<AlertBanner
				variant="warning"
				title={warningTitle}
				description={warningText}
			>
				<AdminPickupEditDialog
					requestId={requestId}
					route={route}
					routeIndex={routeIndex}
					allRoutes={allRoutes}
					drivers={drivers}
					isLoading={isLoading}
					inBanner
					onSave={onSave}
				/>
			</AlertBanner>
		);
	}

	return (
		<>
			<RoutePickupSection
				pickup={route.pickup}
				destination={route.destination}
				driverName={route.driverName}
				driverPhone={route.driverPhone}
				beThereAtDate={route.beThereAtDate}
				beThereAtTime={route.beThereAtTime}
				meetingPoint={route.meetingPoint}
				additionalInfo={route.additionalInfo}
				routeType={route.type}
				flightNumber={route.flightNumber}
				tripInfo={tripInfo}
				isAdmin
				disabled={disabled}
			/>
			{!disabled && (
				<AdminPickupEditDialog
					requestId={requestId}
					route={route}
					routeIndex={routeIndex}
					allRoutes={allRoutes}
					drivers={drivers}
					isLoading={isLoading}
					onSave={onSave}
				/>
			)}
		</>
	);
}
