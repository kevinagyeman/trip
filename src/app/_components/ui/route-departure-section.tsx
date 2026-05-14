"use client";

import { CollapsibleSection } from "@/app/_components/ui/collapsible-section";
import CustomInput from "@/app/_components/ui/custom-input";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { googleCalendarUrl, toICSDateTime } from "@/lib/calendar";
import { format } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export interface DepartureValue {
	scheduledDate: string;
	scheduledTime: string;
	flightNumber: string;
}

interface Props {
	routeType?: string | null;
	scheduledDate?: string | null;
	scheduledTime?: string | null;
	flightNumber?: string | null;
	pickup: string;
	destination: string;
	value: DepartureValue;
	onChange: (field: keyof DepartureValue, val: string) => void;
	onSave: () => void;
	isLoading: boolean;
	canEdit?: boolean;
	afterSave?: ReactNode;
}

export function RouteDepartureSection({
	routeType,
	scheduledDate,
	scheduledTime,
	flightNumber,
	pickup,
	destination,
	value,
	onChange,
	onSave,
	isLoading,
	canEdit = true,
	afterSave,
}: Props) {
	const t = useTranslations("common");

	const isAirport = routeType === "airport_in" || routeType === "airport_out";

	const depLabel =
		routeType === "airport_out"
			? t("departureScheduledTakeoff")
			: routeType === "airport_in"
				? t("departureScheduledLanding")
				: t("departureScheduledArrival");

	const hasDepInfo = !!(scheduledDate ?? scheduledTime ?? flightNumber);

	const title = hasDepInfo ? (
		<span className="flex flex-wrap items-center gap-2">
			<span className="text-muted-foreground">{depLabel}</span>
			{scheduledDate && (
				<span className="font-medium text-foreground">
					{format(new Date(scheduledDate), "d MMM yyyy")}
				</span>
			)}
			{scheduledTime && (
				<span className="font-medium text-foreground">{scheduledTime}</span>
			)}
			{flightNumber && (
				<span className="font-medium text-foreground">{flightNumber}</span>
			)}
			{scheduledDate && (
				<Button
					size="sm"
					variant="ghost"
					className="h-5 px-1.5 text-xs"
					onClick={(e) => {
						e.stopPropagation();
						const [hRaw, mRaw] = (scheduledTime ?? "00:00")
							.split(":")
							.map(Number);
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
					<CalendarPlus className="mr-1 h-3 w-3" />
					{t("googleCalendar")}
				</Button>
			)}
		</span>
	) : (
		<span className="flex flex-wrap items-center gap-2">
			<span className="text-muted-foreground">{depLabel}</span>
			<span className="text-muted-foreground">—</span>
		</span>
	);

	return (
		<CollapsibleSection
			editLabel={canEdit ? t("edit") : undefined}
			title={title}
		>
			{canEdit ? (
				<>
					<div
						className={`grid grid-cols-1 gap-2 ${isAirport ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
					>
						<CustomInput
							labelText={
								routeType === "airport_out"
									? t("routeFlightDate")
									: routeType === "airport_in"
										? t("routeLandingDate")
										: t("routeArrivalDate")
							}
							inputType="date"
							inputProps={{
								value: value.scheduledDate,
								onChange: (e) => onChange("scheduledDate", e.target.value),
							}}
						/>
						<CustomInput
							labelText={
								routeType === "airport_out"
									? t("routeFlightTime")
									: routeType === "airport_in"
										? t("routeLandingTime")
										: t("routeArrivalTime")
							}
							inputType="time"
							inputProps={{
								value: value.scheduledTime,
								onChange: (e) => onChange("scheduledTime", e.target.value),
							}}
						/>
						{isAirport && (
							<CustomInput
								labelText={t("routeFlightNumber")}
								placeholder={t("routeFlightNumberPlaceholder")}
								inputProps={{
									value: value.flightNumber,
									onChange: (e) => onChange("flightNumber", e.target.value),
								}}
							/>
						)}
					</div>
					<div className="mt-2 flex flex-wrap items-center gap-2">
						<LoadingButton size="sm" isLoading={isLoading} onClick={onSave} />
						{afterSave}
					</div>
				</>
			) : (
				hasDepInfo && (
					<div className="space-y-1.5 pt-2 text-xs">
						{scheduledDate && (
							<p>
								<span className="text-muted-foreground">{depLabel} </span>
								<span className="font-medium">
									{format(new Date(scheduledDate), "d MMM yyyy")}
									{scheduledTime && ` · ${scheduledTime}`}
								</span>
							</p>
						)}
						{flightNumber && (
							<p>
								<span className="text-muted-foreground">
									{t("routeFlightNumber")}:{" "}
								</span>
								<span className="font-medium">{flightNumber}</span>
							</p>
						)}
					</div>
				)
			)}
		</CollapsibleSection>
	);
}
