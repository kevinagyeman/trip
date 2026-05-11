"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { CollapsibleSection } from "@/app/_components/ui/collapsible-section";
import { ContactDetailsCard } from "@/app/_components/ui/contact-details-card";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PassengersCard } from "@/app/_components/ui/passengers-card";
import { RequestHeaderCard } from "@/app/_components/ui/request-header-card";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TripMessageThread } from "./trip-message-thread";

import { buildStatusLabels, QUOTATION_STATUS_COLORS } from "@/lib/trip-utils";

function toICSDateTime(date: Date, timeStr?: string | null): string {
	const d = new Date(date);
	if (timeStr) {
		const [h, m] = timeStr.split(":").map(Number);
		d.setHours(h ?? 0, m ?? 0, 0, 0);
	}
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function googleCalendarUrl(params: {
	summary: string;
	description: string;
	location: string;
	start: string;
	end: string;
}): string {
	const p = new URLSearchParams({
		action: "TEMPLATE",
		text: params.summary,
		details: params.description,
		location: params.location,
		dates: `${params.start}/${params.end}`,
	});
	return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function PublicTripRequestDetail({ token }: { token: string }) {
	const t = useTranslations("requestDetail");
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const utils = api.useUtils();

	const {
		data: request,
		isLoading,
		isError,
	} = api.tripRequest.getByToken.useQuery({ token });

	const [routeDepartures, setRouteDepartures] = useState<
		Array<{
			scheduledDate: string;
			scheduledTime: string;
			flightNumber: string;
		}>
	>([]);

	useEffect(() => {
		if (request) {
			setRouteDepartures(
				request.routes.map((r) => ({
					scheduledDate: r.scheduledDate ?? "",
					scheduledTime: r.scheduledTime ?? "",
					flightNumber: r.flightNumber ?? "",
				})),
			);
		}
	}, [request?.id]);

	const markAsViewed = api.tripRequest.markAsViewed.useMutation();
	useEffect(() => {
		markAsViewed.mutate({ token });
	}, [token]);

	const [notified, setNotified] = useState(false);

	const acceptQuotation = api.quotation.acceptByToken.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByToken.invalidate({ token });
		},
	});

	const rejectQuotation = api.quotation.rejectByToken.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByToken.invalidate({ token });
		},
	});

	const updateRoutes = api.tripRequest.updateRoutes.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByToken.invalidate({ token });
			setNotified(true);
		},
	});

	if (isLoading) return <div>{t("loading")}</div>;
	if (isError) return <div>{t("error")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const routes = request.routes;
	const canEdit = !["COMPLETED", "CANCELLED", "CONFIRMED"].includes(
		request.status,
	);
	const hasRejectedQuotation = request.quotations.some(
		(q) => q.status === "REJECTED",
	);

	return (
		<div className="space-y-6">
			{request.status === "CONFIRMED" && (
				<AlertBanner
					variant="success"
					title={t("tripConfirmedTitle")}
					description={t("tripConfirmedDesc")}
				/>
			)}
			{request.quotations.length === 0 && (
				<AlertBanner
					variant="info"
					title={t("quotationPendingTitle")}
					description={t("quotationPendingDesc")}
				/>
			)}
			{hasRejectedQuotation && (
				<AlertBanner
					variant="error"
					title={t("quotationRejected")}
					description={t("quotationRejectedDesc")}
				/>
			)}
			<AlertBanner
				variant="info"
				description={t("emailNotice", { email: request.fromEmail })}
			/>

			{/* Header */}
			<RequestHeaderCard
				orderNumber={request.orderNumber}
				firstName={request.firstName}
				lastName={request.lastName}
				status={request.status}
			/>

			{/* Routes */}
			<SectionCard title={t("routes")} contentClassName="space-y-4 pt-0">
				{routes.map((route, i) => {
					const hasDepInfo = !!(route.scheduledDate ?? route.scheduledTime);
					const depLabel =
						route.type === "airport_out" || route.type === "airport"
							? t("departureScheduledTakeoff")
							: route.type === "airport_in"
								? t("departureScheduledLanding")
								: t("departureScheduledArrival");

					return (
						<div key={i} className="overflow-hidden rounded-lg border text-sm">
							<div className="px-3 py-3">
								<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									{t("routeN", { n: i + 1 })}
								</p>

								<div className="flex items-center gap-2 font-semibold">
									<span>{route.pickup}</span>
									<span className="text-muted-foreground">→</span>
									<span>{route.destination}</span>
								</div>
							</div>

							{/* Departure details */}
							<CollapsibleSection
								title={
									hasDepInfo ? (
										<span className="flex flex-wrap items-center gap-2">
											<span className="text-muted-foreground">{depLabel}</span>
											{route.scheduledDate && (
												<span className="font-medium text-foreground">
													{format(new Date(route.scheduledDate), "d MMM yyyy")}
												</span>
											)}
											{route.scheduledTime && (
												<span className="font-medium text-foreground">
													{route.scheduledTime}
												</span>
											)}
											{route.flightNumber && (
												<span className="text-muted-foreground">
													· {route.flightNumber}
												</span>
											)}
											{route.scheduledDate && (
												<Button
													size="sm"
													variant="ghost"
													className="h-6 px-2 text-xs"
													onClick={(e) => {
														e.stopPropagation();
														const date = new Date(route.scheduledDate!);
														const timeStr = route.scheduledTime ?? "00:00";
														const [h, m] = timeStr.split(":").map(Number);
														const end = new Date(date);
														end.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
														window.open(
															googleCalendarUrl({
																summary: `${route.pickup} → ${route.destination}`,
																description: route.flightNumber
																	? `Flight: ${route.flightNumber}`
																	: "",
																location: route.pickup,
																start: toICSDateTime(date, timeStr),
																end: toICSDateTime(end),
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
									)
								}
								editLabel={canEdit ? t("edit") : undefined}
							>
								{canEdit ? (
									<div className="space-y-3 pt-2">
										<div
											className={
												"grid grid-cols-1 gap-2 " +
												(route.type === "standard" || !route.type
													? "sm:grid-cols-2"
													: "sm:grid-cols-3")
											}
										>
											<div className="space-y-1">
												<Label className="text-xs">
													{route.type === "airport_out" ||
													route.type === "airport"
														? t("routeFlightDate")
														: route.type === "airport_in"
															? t("routeLandingDate")
															: t("routeArrivalDate")}
												</Label>
												<Input
													type="date"
													value={routeDepartures[i]?.scheduledDate ?? ""}
													onChange={(e) =>
														setRouteDepartures((prev) => {
															const next = [...prev];
															if (next[i])
																next[i]!.scheduledDate = e.target.value;
															return next;
														})
													}
												/>
											</div>
											<div className="space-y-1">
												<Label className="text-xs">
													{route.type === "airport_out" ||
													route.type === "airport"
														? t("routeFlightTime")
														: route.type === "airport_in"
															? t("routeLandingTime")
															: t("routeArrivalTime")}
												</Label>
												<Input
													type="time"
													value={routeDepartures[i]?.scheduledTime ?? ""}
													onChange={(e) =>
														setRouteDepartures((prev) => {
															const next = [...prev];
															if (next[i])
																next[i]!.scheduledTime = e.target.value;
															return next;
														})
													}
												/>
											</div>
											{(route.type === "airport_out" ||
												route.type === "airport_in" ||
												route.type === "airport") && (
												<div className="space-y-1">
													<Label className="text-xs">
														{t("routeFlightNumber")}
													</Label>
													<Input
														placeholder={t("routeFlightNumberPlaceholder")}
														value={routeDepartures[i]?.flightNumber ?? ""}
														onChange={(e) =>
															setRouteDepartures((prev) => {
																const next = [...prev];
																if (next[i])
																	next[i]!.flightNumber = e.target.value;
																return next;
															})
														}
													/>
												</div>
											)}
										</div>
										<div className="flex items-center gap-3">
											<LoadingButton
												size="sm"
												variant="outline"
												isLoading={updateRoutes.isPending}
												onClick={() => {
													setNotified(false);
													updateRoutes.mutate({
														token,
														routes: routes.map((_, j) => ({
															scheduledDate:
																routeDepartures[j]?.scheduledDate || undefined,
															scheduledTime:
																routeDepartures[j]?.scheduledTime || undefined,
															flightNumber:
																routeDepartures[j]?.flightNumber || undefined,
														})),
													});
												}}
											>
												{t("saveRouteDetails")}
											</LoadingButton>
											{notified && (
												<p className="text-xs text-muted-foreground">
													{t("adminNotified")}
												</p>
											)}
										</div>
									</div>
								) : (
									hasDepInfo && (
										<div className="space-y-1.5 pt-2 text-xs">
											{route.scheduledDate && (
												<p>
													<span className="text-muted-foreground">
														{depLabel}{" "}
													</span>
													<span className="font-medium">
														{format(
															new Date(route.scheduledDate),
															"d MMM yyyy",
														)}
														{route.scheduledTime && ` · ${route.scheduledTime}`}
													</span>
												</p>
											)}
											{route.flightNumber && (
												<p>
													<span className="text-muted-foreground">
														{t("routeFlightNumber")}:{" "}
													</span>
													<span className="font-medium">
														{route.flightNumber}
													</span>
												</p>
											)}
										</div>
									)
								)}
							</CollapsibleSection>

							{/* Pickup info */}
							{(route.meetingPoint ??
								route.beThereAtDate ??
								route.driverName) && (
								<CollapsibleSection
									title={
										route.driverName ? (
											<span className="flex flex-wrap items-center gap-2">
												<span className="text-muted-foreground">
													{t("pickupScheduled")}
												</span>
												{route.beThereAtDate && (
													<span className="font-medium text-foreground">
														{format(
															new Date(route.beThereAtDate),
															"d MMM yyyy",
														)}
													</span>
												)}
												{route.beThereAtTime && (
													<span className="font-medium text-foreground">
														{route.beThereAtTime}
													</span>
												)}
												<span className="font-medium text-foreground">
													{route.driverName}
												</span>
												{route.beThereAtDate && (
													<Button
														size="sm"
														variant="ghost"
														className="h-6 px-2 text-xs"
														onClick={(e) => {
															e.stopPropagation();
															const date = new Date(route.beThereAtDate!);
															const timeStr = route.beThereAtTime ?? "00:00";
															const [h, m] = timeStr.split(":").map(Number);
															const end = new Date(date);
															end.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
															const summary = `${route.pickup} → ${route.destination}`;
															const desc = [
																route.driverName &&
																	`Driver: ${route.driverName}`,
																route.driverPhone &&
																	`Phone: ${route.driverPhone}`,
																route.additionalInfo,
															]
																.filter(Boolean)
																.join("\n");
															window.open(
																googleCalendarUrl({
																	summary,
																	description: desc,
																	location: route.meetingPoint ?? route.pickup,
																	start: toICSDateTime(date, timeStr),
																	end: toICSDateTime(end),
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
												<span className="text-muted-foreground">
													{t("pickupScheduled")}
												</span>
												<span className="text-muted-foreground">—</span>
											</span>
										)
									}
								>
									<div className="space-y-1.5 pt-2 text-xs">
										{route.meetingPoint && (
											<p>
												<span className="text-muted-foreground">
													{t("pickupInfoMeetingPoint")}:{" "}
												</span>
												<span className="font-medium">
													{route.meetingPoint}
												</span>
											</p>
										)}
										{(route.beThereAtDate ?? route.beThereAtTime) && (
											<p>
												<span className="text-muted-foreground">
													{t("pickupInfoBeThereAt")}:{" "}
												</span>
												<span className="font-medium">
													{route.beThereAtDate &&
														format(new Date(route.beThereAtDate), "d MMM yyyy")}
													{route.beThereAtDate && route.beThereAtTime && " · "}
													{route.beThereAtTime}
												</span>
											</p>
										)}
										{route.driverName && (
											<p>
												<span className="text-muted-foreground">
													{t("pickupInfoDriverName")}:{" "}
												</span>
												<span className="font-medium">{route.driverName}</span>
											</p>
										)}
										{route.driverPhone && (
											<p>
												<span className="text-muted-foreground">
													{t("pickupInfoDriverPhone")}:{" "}
												</span>
												<a
													href={`tel:${route.driverPhone}`}
													className="font-medium underline"
												>
													{route.driverPhone}
												</a>
											</p>
										)}
										{route.additionalInfo && (
											<p>
												<span className="text-muted-foreground">
													{t("pickupInfoAdditionalInfo")}:{" "}
												</span>
												<span className="font-medium">
													{route.additionalInfo}
												</span>
											</p>
										)}
									</div>
								</CollapsibleSection>
							)}
						</div>
					);
				})}
			</SectionCard>

			{/* Contact */}
			<ContactDetailsCard
				email={request.customerEmail}
				phone={request.phone}
				language={request.language}
				firstName={request.firstName}
				lastName={request.lastName}
			/>

			{/* Passengers */}
			<PassengersCard
				numberOfAdults={request.numberOfAdults}
				areThereChildren={request.areThereChildren}
				numberOfChildren={request.numberOfChildren}
				ageOfChildren={request.ageOfChildren}
				numberOfChildSeats={request.numberOfChildSeats}
				additionalInfo={request.additionalInfo}
			/>

			{/* Quotations */}
			{request.quotations.map((quotation) => (
				<SectionCard
					key={quotation.id}
					title={
						<div className="flex items-center gap-2">
							<span>{t("quotations")}</span>
							<Badge className={QUOTATION_STATUS_COLORS[quotation.status]}>
								{quotation.status}
							</Badge>
						</div>
					}
					contentClassName="space-y-4 pt-0"
				>
					<div>
						<p className="text-2xl font-bold">
							{quotation.currency} {quotation.price.toString()}
						</p>
						{quotation.isPriceEachWay && (
							<p className="text-sm text-muted-foreground">
								{t("priceEachWay")}
							</p>
						)}
						{quotation.areCarSeatsIncluded && (
							<p className="text-sm text-muted-foreground">
								{t("carSeatsIncluded")}
							</p>
						)}
					</div>
					{quotation.quotationAdditionalInfo && (
						<div>
							<p className="text-sm text-muted-foreground">
								{t("additionalInfoLabel")}
							</p>
							<p className="mt-1 whitespace-pre-wrap text-sm">
								{quotation.quotationAdditionalInfo}
							</p>
						</div>
					)}
					{quotation.notifiedAt && (
						<p className="text-sm text-muted-foreground">
							{t("notifiedDate", {
								date: format(new Date(quotation.notifiedAt), "d MMM yyyy"),
								time: format(new Date(quotation.notifiedAt), "HH:mm"),
							})}
						</p>
					)}
					{quotation.status === "PENDING" && quotation.notifiedAt && (
						<div className="flex gap-2">
							<Button
								onClick={() =>
									acceptQuotation.mutate({ id: quotation.id, token })
								}
								disabled={
									acceptQuotation.isPending || rejectQuotation.isPending
								}
							>
								{t("acceptQuotation")}
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									rejectQuotation.mutate({ id: quotation.id, token })
								}
								disabled={
									acceptQuotation.isPending || rejectQuotation.isPending
								}
							>
								{t("rejectQuotation")}
							</Button>
						</div>
					)}
				</SectionCard>
			))}

			{/* Messages */}
			<SectionCard contentClassName="pt-0">
				<TripMessageThread mode="customer" token={token} />
			</SectionCard>
		</div>
	);
}
