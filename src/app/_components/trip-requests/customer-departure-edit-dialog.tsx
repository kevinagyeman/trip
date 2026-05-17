"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { AppDialog } from "@/app/_components/ui/app-dialog";
import CustomInput from "@/app/_components/ui/custom-input";
import { Button } from "@/components/ui/button";
import { Route } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface RouteData {
	type?: string | null;
	scheduledDate?: string | null;
	scheduledTime?: string | null;
	flightNumber?: string | null;
}

interface Props {
	route: RouteData;
	routeIndex: number;
	allRoutes: RouteData[];
	isLoading: boolean;
	label?: string;
	onSave: (
		routes: Array<{
			scheduledDate?: string;
			scheduledTime?: string;
			flightNumber?: string;
		}>,
		options: { onSuccess: () => void },
	) => void;
}

export function CustomerDepartureEditDialog({
	route,
	routeIndex,
	allRoutes,
	isLoading,
	label,
	onSave,
}: Props) {
	const t = useTranslations("requestDetail");
	const tCommon = useTranslations("common");

	const [open, setOpen] = useState(false);
	const [scheduledDate, setScheduledDate] = useState("");
	const [scheduledTime, setScheduledTime] = useState("");
	const [flightNumber, setFlightNumber] = useState("");

	// Reset on open
	useEffect(() => {
		if (!open) return;
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
		const routes = allRoutes.map((r, j) => {
			if (j === routeIndex) {
				return {
					scheduledDate: scheduledDate || undefined,
					scheduledTime: scheduledTime || undefined,
					flightNumber: flightNumber || undefined,
				};
			}
			return {
				scheduledDate: r.scheduledDate ?? undefined,
				scheduledTime: r.scheduledTime ?? undefined,
				flightNumber: r.flightNumber ?? undefined,
			};
		});

		onSave(routes, { onSuccess: () => setOpen(false) });
	};

	return (
		<AppDialog
			open={open}
			onOpenChange={setOpen}
			title={label ?? t("editDepartureTitle")}
			onSave={handleSave}
			isLoading={isLoading}
			trigger={
				<Button variant="secondary" size="sm">
					<Route />
					{label ?? t("editDeparture")}
				</Button>
			}
		>
			<div className="space-y-4">
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
				<AlertBanner variant="info" description={t("editDepartureNotice")} />
			</div>
		</AppDialog>
	);
}
