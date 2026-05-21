"use client";

import { AppDialog } from "@/app/_components/ui/app-dialog";
import CustomInput from "@/app/_components/ui/custom-input";
import { Button } from "@/components/ui/button";
import { Route } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface RouteData {
	pickup: string;
	destination: string;
	type?: string | null;
	scheduledDate?: string | null;
	scheduledTime?: string | null;
	flightNumber?: string | null;
	meetingPoint?: string | null;
	beThereAtDate?: string | null;
	beThereAtTime?: string | null;
	driverName?: string | null;
	driverPhone?: string | null;
	additionalInfo?: string | null;
}

interface Props {
	requestId: string;
	route: RouteData;
	routeIndex: number;
	allRoutes: RouteData[];
	isLoading: boolean;
	label?: string;
	onSave: (
		input: {
			id: string;
			notify?: boolean;
			routes: Array<{
				pickup: string;
				destination: string;
				type?: "airport_in" | "standard" | "airport_out";
				scheduledDate?: string;
				scheduledTime?: string;
				flightNumber?: string;
				meetingPoint?: string;
				beThereAtDate?: string;
				beThereAtTime?: string;
				driverName?: string;
				driverPhone?: string;
				additionalInfo?: string;
			}>;
		},
		options: { onSuccess: () => void },
	) => void;
}

export function AdminRouteEditDialog({
	requestId,
	route,
	routeIndex,
	allRoutes,
	isLoading,
	label,
	onSave,
}: Props) {
	const t = useTranslations("adminDetail");
	const tCommon = useTranslations("common");

	const [open, setOpen] = useState(false);

	const [pickup, setPickup] = useState("");
	const [destination, setDestination] = useState("");
	const [scheduledDate, setScheduledDate] = useState("");
	const [scheduledTime, setScheduledTime] = useState("");
	const [flightNumber, setFlightNumber] = useState("");

	useEffect(() => {
		if (!open) return;
		setPickup(route.pickup);
		setDestination(route.destination);
		setScheduledDate(route.scheduledDate ?? "");
		setScheduledTime(route.scheduledTime ?? "");
		setFlightNumber(route.flightNumber ?? "");
	}, [open, route]);

	const isAirport = route.type === "airport_in" || route.type === "airport_out";

	const dateLabel =
		route.type === "airport_out"
			? tCommon("routeFlightDate")
			: route.type === "airport_in"
				? tCommon("routeLandingDate")
				: tCommon("routeArrivalDate");

	const timeLabel =
		route.type === "airport_out"
			? tCommon("routeFlightTime")
			: route.type === "airport_in"
				? tCommon("routeLandingTime")
				: tCommon("routeArrivalTime");

	const handleSave = () => {
		const routes = allRoutes.map((r, j) => ({
			pickup: j === routeIndex ? pickup : r.pickup,
			destination: j === routeIndex ? destination : r.destination,
			type: (r.type ?? undefined) as
				| "airport_in"
				| "standard"
				| "airport_out"
				| undefined,
			scheduledDate:
				j === routeIndex
					? scheduledDate || undefined
					: (r.scheduledDate ?? undefined),
			scheduledTime:
				j === routeIndex
					? scheduledTime || undefined
					: (r.scheduledTime ?? undefined),
			flightNumber:
				j === routeIndex
					? flightNumber || undefined
					: (r.flightNumber ?? undefined),
			meetingPoint: r.meetingPoint ?? undefined,
			beThereAtDate: r.beThereAtDate ?? undefined,
			beThereAtTime: r.beThereAtTime ?? undefined,
			driverName: r.driverName ?? undefined,
			driverPhone: r.driverPhone ?? undefined,
			additionalInfo: r.additionalInfo ?? undefined,
		}));

		onSave({ id: requestId, routes }, { onSuccess: () => setOpen(false) });
	};

	return (
		<AppDialog
			open={open}
			onOpenChange={setOpen}
			title={label ?? t("editRoute")}
			onSave={handleSave}
			isLoading={isLoading}
			trigger={
				<Button variant="secondary" size="sm" className="w-full sm:w-auto">
					<Route />
					{label ?? t("editRoute")}
				</Button>
			}
		>
			<div className="space-y-6">
				<div className="space-y-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{t("routeSection")}
					</p>
					<div className="flex flex-col gap-3">
						<CustomInput
							labelText={
								route.type === "airport_in"
									? tCommon("routeFromAirport")
									: tCommon("routeFrom")
							}
							inputProps={{
								value: pickup,
								onChange: (e) => setPickup(e.target.value),
							}}
						/>
						<CustomInput
							labelText={
								route.type === "airport_out"
									? tCommon("routeToAirport")
									: tCommon("routeTo")
							}
							inputProps={{
								value: destination,
								onChange: (e) => setDestination(e.target.value),
							}}
						/>
					</div>
				</div>

				<div className="space-y-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{t("departureSection")}
					</p>
					<div className="flex flex-col gap-3">
						<CustomInput
							labelText={dateLabel}
							inputType="date"
							inputProps={{
								value: scheduledDate,
								onChange: (e) => setScheduledDate(e.target.value),
							}}
						/>
						<CustomInput
							labelText={timeLabel}
							inputType="time"
							inputProps={{
								value: scheduledTime,
								onChange: (e) => setScheduledTime(e.target.value),
							}}
						/>
						{isAirport && (
							<CustomInput
								labelText={tCommon("routeFlightNumber")}
								placeholder={tCommon("routeFlightNumberPlaceholder")}
								inputProps={{
									value: flightNumber,
									onChange: (e) => setFlightNumber(e.target.value),
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</AppDialog>
	);
}
