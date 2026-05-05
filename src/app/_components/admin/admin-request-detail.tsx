"use client";

import { QuotationForm } from "@/app/_components/admin/quotation-form";
import { TripMessageThread } from "@/app/_components/trip-requests/trip-message-thread";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_LABELS } from "@/lib/quick-fill";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { CalendarPlus, Check, Copy, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { TripRequestStatus } from "../../../../generated/prisma";

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

import type { PickupInfo, Route } from "@/lib/trip-utils";
import {
	buildStatusLabels,
	parseRoutes,
	STATUS_COLORS,
} from "@/lib/trip-utils";

export function AdminRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
	const t = useTranslations("adminDetail");
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const utils = api.useUtils();

	const { data: request, isLoading } = api.tripRequest.getByIdAdmin.useQuery({
		id: requestId,
	});

	const [pendingStatus, setPendingStatus] = useState<TripRequestStatus | null>(
		null,
	);

	// Route departures state (admin editable)
	const [adminRoutePlaces, setAdminRoutePlaces] = useState<
		Array<{ pickup: string; destination: string }>
	>([]);

	const [adminRouteDepartures, setAdminRouteDepartures] = useState<
		Array<{
			departureDate: string;
			departureTime: string;
			flightNumber: string;
		}>
	>([]);

	// Pickup info state (admin fills after CONFIRMED)
	const [adminPickupInfos, setAdminPickupInfos] = useState<PickupInfo[]>([]);

	useEffect(() => {
		if (request) {
			const parsed = parseRoutes(request.routes);
			setAdminRoutePlaces(
				parsed.map((r) => ({
					pickup: r.pickup,
					destination: r.destination,
				})),
			);
			setAdminRouteDepartures(
				parsed.map((r) => ({
					departureDate: r.departureDate ?? "",
					departureTime: r.departureTime ?? "",
					flightNumber: r.flightNumber ?? "",
				})),
			);
			setAdminPickupInfos(
				parsed.map((r) => ({
					meetingPoint: r.pickupInfo?.meetingPoint ?? "",
					beThereAtDate: r.pickupInfo?.beThereAtDate ?? "",
					beThereAtTime: r.pickupInfo?.beThereAtTime ?? "",
					driverName: r.pickupInfo?.driverName ?? "",
					driverPhone: r.pickupInfo?.driverPhone ?? "",
				})),
			);
		}
	}, [request?.id]);

	const updateStatus = api.tripRequest.updateStatus.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
			await utils.tripRequest.getAllRequests.invalidate();
		},
	});

	const updateRoutesByAdmin = api.tripRequest.updateRoutesByAdmin.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
		},
	});

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [copiedLink, setCopiedLink] = useState(false);

	const confirmTrip = api.tripRequest.confirmByAdmin.useMutation({
		onSuccess: async () => {
			setConfirmOpen(false);
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
			await utils.tripRequest.getAllRequests.invalidate();
		},
	});

	const requestDepartureDetails =
		api.tripRequest.requestDepartureDetails.useMutation({
			onSuccess: async () => {
				await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
			},
		});

	const [whatsappHref, setWhatsappHref] = useState("");

	useEffect(() => {
		if (!request) return;
		const link = `${window.location.origin}/request/${request.token}`;
		const orderNum = String(request.orderNumber).padStart(6, "0");
		const company = request.company.name;
		const msg =
			request.language === "it"
				? `Siamo ${company} e la stiamo contattando riguardo alla Sua richiesta di trasferimento #${orderNum}.\nAbbiamo aggiornato la Sua richiesta, può visualizzarla qui:\n${link}`
				: `We are ${company} and we are writing to you about your transfer request #${orderNum}.\nWe have updated your request, you can view it here:\n${link}`;
		setWhatsappHref(
			`https://wa.me/${request.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`,
		);
	}, [request]);

	if (isLoading) return <div>{t("loading")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const routes: Route[] = parseRoutes(request.routes);

	// Derived status helpers
	const quotation = request.quotations[0];
	const isQuotationAccepted = quotation?.status === "ACCEPTED";
	const isQuotationRejected = quotation?.status === "REJECTED";
	const isQuotationSent = !!quotation?.notifiedAt;

	const estimateNotice = (() => {
		try {
			const n = JSON.parse(request.company?.estimateNotice ?? "{}") as Record<
				string,
				string
			>;
			return n[request.language] ?? n.en ?? "";
		} catch {
			return "";
		}
	})();

	return (
		<div className="space-y-4">
			<Button variant="outline" size="sm" onClick={() => router.back()}>
				{t("backToDashboard")}
			</Button>

			{/* Header card */}
			<Card>
				<CardContent className="pt-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="space-y-0.5">
							<p className="text-xs font-medium text-muted-foreground">
								#{String(request.orderNumber).padStart(7, "0")}
							</p>
							<h2 className="text-2xl font-bold">
								{request.firstName} {request.lastName}
							</h2>
							<p className="text-sm text-muted-foreground">
								{request.user?.email ?? request.customerEmail}
							</p>
							{request.phone && (
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-sm text-muted-foreground">
										{request.phone}
									</span>
									<a
										href={whatsappHref}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-green-700"
									>
										<MessageCircle className="h-3 w-3" />
										WhatsApp
									</a>
									<a
										href={`tel:${request.phone}`}
										className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-blue-700"
									>
										<Phone className="h-3 w-3" />
										{t("call")}
									</a>
								</div>
							)}
							<p className="text-sm text-muted-foreground">
								{t("language")}:{" "}
								{LANGUAGE_LABELS[request.language] ?? request.language}
							</p>
						</div>
						<div className="flex flex-shrink-0 flex-wrap items-center gap-2">
							<Badge className={STATUS_COLORS[request.status]}>
								{statusLabels[request.status] ?? request.status}
							</Badge>
							{!["COMPLETED", "CANCELLED"].includes(request.status) && (
								<Select
									value={pendingStatus ?? ""}
									onValueChange={(value) =>
										setPendingStatus(value as TripRequestStatus)
									}
								>
									<SelectTrigger className="w-[140px]">
										<SelectValue placeholder={t("markAs")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="COMPLETED">
											{t("statusCompleted")}
										</SelectItem>
										<SelectItem value="CANCELLED">
											{t("statusCancelled")}
										</SelectItem>
									</SelectContent>
								</Select>
							)}
							{pendingStatus && pendingStatus !== request.status && (
								<LoadingButton
									size="sm"
									isLoading={updateStatus.isPending}
									onClick={() => {
										updateStatus.mutate(
											{ id: requestId, status: pendingStatus },
											{ onSuccess: () => setPendingStatus(null) },
										);
									}}
								>
									{t("saveStatus")}
								</LoadingButton>
							)}
						</div>
					</div>

					{/* Customer link */}
					<div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed p-3">
						<div className="min-w-0 flex-1">
							<p className="text-xs font-medium">{t("customerLinkLabel")}</p>
							<p className="text-xs text-muted-foreground">
								{t("customerLinkWarning")}
							</p>
						</div>
						<Button
							size="sm"
							variant="outline"
							className="shrink-0"
							onClick={async () => {
								await navigator.clipboard.writeText(
									`${window.location.origin}/request/${request.token}`,
								);
								setCopiedLink(true);
								setTimeout(() => setCopiedLink(false), 2000);
							}}
						>
							{copiedLink ? (
								<Check className="h-4 w-4 text-green-500" />
							) : (
								<Copy className="h-4 w-4" />
							)}
							<span className="ml-1.5">
								{copiedLink ? t("copied") : t("copyCustomerLink")}
							</span>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Routes */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">{t("routes")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-0">
					{routes.map((route, i) => {
						const hasDepInfo = !!(route.departureDate ?? route.departureTime);
						const hasPickupInfo = !!(
							route.pickupInfo?.meetingPoint ?? route.pickupInfo?.driverName
						);
						return (
							<div key={i} className="rounded-lg border text-sm">
								{/* Route header */}
								<div className="flex items-start justify-between gap-3 p-3">
									<div className="w-full space-y-2">
										<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											{route.type === "airport_in"
												? t("sectionArrival")
												: route.type === "airport_out" ||
														route.type === "airport"
													? t("sectionDeparture")
													: t("routeN", { n: i + 1 })}
										</p>
										<div className="flex flex-wrap items-center gap-2">
											<Input
												className="h-7 w-auto min-w-[140px] flex-1 text-sm font-semibold"
												value={adminRoutePlaces[i]?.pickup ?? route.pickup}
												onChange={(e) =>
													setAdminRoutePlaces((prev) => {
														const next = [...prev];
														if (next[i]) next[i]!.pickup = e.target.value;
														return next;
													})
												}
											/>
											<span className="text-muted-foreground">→</span>
											<Input
												className="h-7 w-auto min-w-[140px] flex-1 text-sm font-semibold"
												value={
													adminRoutePlaces[i]?.destination ?? route.destination
												}
												onChange={(e) =>
													setAdminRoutePlaces((prev) => {
														const next = [...prev];
														if (next[i]) next[i]!.destination = e.target.value;
														return next;
													})
												}
											/>
										</div>
									</div>
								</div>

								{/* Current departure info pills */}
								{(route.departureDate ??
									route.departureTime ??
									route.flightNumber) && (
									<div className="flex flex-wrap gap-1.5 border-t px-3 pb-2 pt-2">
										{(route.departureDate ?? route.departureTime) && (
											<span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
												{route.departureDate &&
													format(new Date(route.departureDate), "d MMM yyyy")}
												{route.departureDate && route.departureTime && " · "}
												{route.departureTime}
											</span>
										)}
										{route.flightNumber && (
											<span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
												{route.flightNumber}
											</span>
										)}
									</div>
								)}

								{/* Departure details form */}
								<div className="border-t border-dashed p-3">
									<p className="mb-2 text-xs font-medium text-muted-foreground">
										{route.type === "airport_in"
											? t("routeLandingDetails")
											: route.type === "airport_out" || route.type === "airport"
												? t("routeFlightDetails")
												: t("routeDepartureDetails")}
									</p>
									<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
										<div className="space-y-1">
											<Label className="text-xs">
												{route.type === "airport_out" ||
												route.type === "airport"
													? t("routeFlightDate")
													: route.type === "airport_in"
														? t("routeLandingDate")
														: t("routeDepartureDate")}
											</Label>
											<Input
												className="h-7 text-xs"
												type="date"
												value={adminRouteDepartures[i]?.departureDate ?? ""}
												onChange={(e) =>
													setAdminRouteDepartures((prev) => {
														const next = [...prev];
														if (next[i])
															next[i]!.departureDate = e.target.value;
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
														: t("routeDepartureTime")}
											</Label>
											<Input
												className="h-7 text-xs"
												type="time"
												value={adminRouteDepartures[i]?.departureTime ?? ""}
												onChange={(e) =>
													setAdminRouteDepartures((prev) => {
														const next = [...prev];
														if (next[i])
															next[i]!.departureTime = e.target.value;
														return next;
													})
												}
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">
												{t("routeFlightNumber")}
											</Label>
											<Input
												className="h-7 text-xs"
												placeholder={t("routeFlightNumberPlaceholder")}
												value={adminRouteDepartures[i]?.flightNumber ?? ""}
												onChange={(e) =>
													setAdminRouteDepartures((prev) => {
														const next = [...prev];
														if (next[i]) next[i]!.flightNumber = e.target.value;
														return next;
													})
												}
											/>
										</div>
									</div>
									<div className="mt-2 flex flex-wrap items-center gap-2">
										<LoadingButton
											size="sm"
											variant="outline"
											isLoading={updateRoutesByAdmin.isPending}
											onClick={() =>
												updateRoutesByAdmin.mutate({
													id: requestId,
													routes: routes.map((r, j) => ({
														...r,
														pickup: adminRoutePlaces[j]?.pickup ?? r.pickup,
														destination:
															adminRoutePlaces[j]?.destination ?? r.destination,
														departureDate:
															adminRouteDepartures[j]?.departureDate ||
															undefined,
														departureTime:
															adminRouteDepartures[j]?.departureTime ||
															undefined,
														flightNumber:
															adminRouteDepartures[j]?.flightNumber ||
															undefined,
													})),
												})
											}
										>
											{t("saveRouteDetails")}
										</LoadingButton>
										{route.departureDate && (
											<Button
												size="sm"
												variant="ghost"
												onClick={() => {
													const [hRaw, mRaw] = (route.departureTime ?? "00:00")
														.split(":")
														.map(Number);
													const endH = ((hRaw ?? 0) + 1) % 24;
													const start = toICSDateTime(
														new Date(route.departureDate!),
														route.departureTime,
													);
													const end = toICSDateTime(
														new Date(route.departureDate!),
														`${String(endH).padStart(2, "0")}:${String(mRaw ?? 0).padStart(2, "0")}`,
													);
													const summary = `${t("routeN", { n: i + 1 })}: ${route.pickup} → ${route.destination}`;
													const desc = route.flightNumber
														? `${t("routeFlightNumber")}: ${route.flightNumber}`
														: "";
													window.open(
														googleCalendarUrl({
															summary,
															description: desc,
															location: route.pickup,
															start,
															end,
														}),
														"_blank",
													);
												}}
											>
												<CalendarPlus className="mr-1 h-3 w-3" />
												{t("googleCalendar")}
											</Button>
										)}
									</div>
								</div>

								{/* Pickup info — only when CONFIRMED */}
								{request.status === "CONFIRMED" && (
									<div className="border-t border-dashed p-3">
										<div className="mb-2 flex items-center justify-between">
											<p className="text-xs font-medium text-muted-foreground">
												{t("pickupInfoTitle")}
											</p>
										</div>
										<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
											<div className="space-y-1 sm:col-span-2">
												<Label className="text-xs">
													{t("pickupInfoMeetingPoint")}
												</Label>
												<Input
													className="h-7 text-xs"
													placeholder={t("pickupInfoMeetingPointPlaceholder")}
													value={adminPickupInfos[i]?.meetingPoint ?? ""}
													onChange={(e) =>
														setAdminPickupInfos((prev) => {
															const next = [...prev];
															if (next[i])
																next[i]!.meetingPoint = e.target.value;
															return next;
														})
													}
												/>
											</div>
											<div className="space-y-1">
												<Label className="text-xs">
													{t("pickupInfoBeThereAtDate")}
												</Label>
												<Input
													className="h-7 text-xs"
													type="date"
													value={adminPickupInfos[i]?.beThereAtDate ?? ""}
													onChange={(e) =>
														setAdminPickupInfos((prev) => {
															const next = [...prev];
															if (next[i])
																next[i]!.beThereAtDate = e.target.value;
															return next;
														})
													}
												/>
											</div>
											<div className="space-y-1">
												<Label className="text-xs">
													{t("pickupInfoBeThereAtTime")}
												</Label>
												<Input
													className="h-7 text-xs"
													type="time"
													value={adminPickupInfos[i]?.beThereAtTime ?? ""}
													onChange={(e) =>
														setAdminPickupInfos((prev) => {
															const next = [...prev];
															if (next[i])
																next[i]!.beThereAtTime = e.target.value;
															return next;
														})
													}
												/>
											</div>
											<div className="space-y-1">
												<Label className="text-xs">
													{t("pickupInfoDriverName")}
												</Label>
												<Input
													className="h-7 text-xs"
													placeholder={t("pickupInfoDriverNamePlaceholder")}
													value={adminPickupInfos[i]?.driverName ?? ""}
													onChange={(e) =>
														setAdminPickupInfos((prev) => {
															const next = [...prev];
															if (next[i]) next[i]!.driverName = e.target.value;
															return next;
														})
													}
												/>
											</div>
											<div className="space-y-1">
												<Label className="text-xs">
													{t("pickupInfoDriverPhone")}
												</Label>
												<Input
													className="h-7 text-xs"
													placeholder={t("pickupInfoDriverPhonePlaceholder")}
													value={adminPickupInfos[i]?.driverPhone ?? ""}
													onChange={(e) =>
														setAdminPickupInfos((prev) => {
															const next = [...prev];
															if (next[i])
																next[i]!.driverPhone = e.target.value;
															return next;
														})
													}
												/>
											</div>
										</div>
										<div className="mt-2 mb-3 flex flex-wrap gap-2">
											<LoadingButton
												size="sm"
												isLoading={updateRoutesByAdmin.isPending}
												onClick={() =>
													updateRoutesByAdmin.mutate({
														id: requestId,
														notify: true,
														routes: routes.map((r, j) => ({
															...r,
															pickup: adminRoutePlaces[j]?.pickup ?? r.pickup,
															destination:
																adminRoutePlaces[j]?.destination ??
																r.destination,
															departureDate:
																adminRouteDepartures[j]?.departureDate ||
																undefined,
															departureTime:
																adminRouteDepartures[j]?.departureTime ||
																undefined,
															flightNumber:
																adminRouteDepartures[j]?.flightNumber ||
																undefined,
															pickupInfo: {
																meetingPoint:
																	adminPickupInfos[j]?.meetingPoint ||
																	undefined,
																beThereAtDate:
																	adminPickupInfos[j]?.beThereAtDate ||
																	undefined,
																beThereAtTime:
																	adminPickupInfos[j]?.beThereAtTime ||
																	undefined,
																driverName:
																	adminPickupInfos[j]?.driverName || undefined,
																driverPhone:
																	adminPickupInfos[j]?.driverPhone || undefined,
															},
														})),
													})
												}
											>
												{t("saveAndNotifyCustomer")}
											</LoadingButton>
											<Button
												size="sm"
												variant="outline"
												type="button"
												onClick={() => {
													const dateStr =
														adminPickupInfos[i]?.beThereAtDate ?? "";
													const date = dateStr ? new Date(dateStr) : new Date();
													const timeStr =
														adminPickupInfos[i]?.beThereAtTime ?? "00:00";
													const [h, m] = timeStr.split(":").map(Number);
													const end = new Date(date);
													end.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
													const summary = `${t("routeN", { n: i + 1 })}: ${adminRoutePlaces[i]?.pickup ?? route.pickup} → ${adminRoutePlaces[i]?.destination ?? route.destination}`;
													const desc = [
														adminPickupInfos[i]?.driverName &&
															`${t("pickupInfoDriverName")}: ${adminPickupInfos[i]!.driverName}`,
														adminPickupInfos[i]?.driverPhone &&
															`${t("pickupInfoDriverPhone")}: ${adminPickupInfos[i]!.driverPhone}`,
													]
														.filter(Boolean)
														.join("\n");
													window.open(
														googleCalendarUrl({
															summary,
															description: desc,
															location: adminPickupInfos[i]?.meetingPoint ?? "",
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
										</div>
										{request.pickupInfoNotifiedAt && (
											<p className="text-xs text-muted-foreground">
												{t("notifiedDate", {
													date: format(
														new Date(request.pickupInfoNotifiedAt),
														"d MMM yyyy",
													),
													time: format(
														new Date(request.pickupInfoNotifiedAt),
														"HH:mm",
													),
												})}
											</p>
										)}
									</div>
								)}
							</div>
						);
					})}
				</CardContent>
			</Card>

			{/* Passengers */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">{t("passengers")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1.5 pt-0 text-sm">
					{request.numberOfAdults > 0 && (
						<p>
							<span className="text-muted-foreground">{t("adults")}: </span>
							<span className="font-medium">{request.numberOfAdults}</span>
						</p>
					)}
					{request.areThereChildren && request.numberOfChildren !== null && (
						<p>
							<span className="text-muted-foreground">
								{t("numberOfChildren")}:{" "}
							</span>
							<span className="font-medium">{request.numberOfChildren}</span>
						</p>
					)}
					{request.areThereChildren && request.ageOfChildren && (
						<p>
							<span className="text-muted-foreground">
								{t("agesOfChildren")}:{" "}
							</span>
							<span className="font-medium">{request.ageOfChildren}</span>
						</p>
					)}
					{request.areThereChildren && request.numberOfChildSeats !== null && (
						<p>
							<span className="text-muted-foreground">
								{t("childSeatsNeeded")}:{" "}
							</span>
							<span className="font-medium">{request.numberOfChildSeats}</span>
						</p>
					)}
					{request.additionalInfo && (
						<p>
							<span className="text-muted-foreground">
								{t("additionalInformation")}:{" "}
							</span>
							<span className="font-medium">{request.additionalInfo}</span>
						</p>
					)}
				</CardContent>
			</Card>

			{/* Quotation */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base">{t("quotation")}</CardTitle>
						{quotation && (
							<Badge
								className={
									isQuotationAccepted
										? "bg-green-500"
										: isQuotationRejected
											? "bg-red-500"
											: isQuotationSent
												? "bg-blue-500"
												: "bg-muted text-muted-foreground"
								}
							>
								{isQuotationAccepted
									? t("statusAccepted")
									: isQuotationRejected
										? t("statusRejected")
										: isQuotationSent
											? t("quotationSentLabel")
											: t("quotationDraftLabel")}
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4 pt-0">
					{isQuotationAccepted ? (
						<>
							<div className="flex items-start justify-between">
								<div>
									<p className="text-2xl font-bold">
										{quotation!.currency} {quotation!.price.toString()}
									</p>
									{quotation!.isPriceEachWay && (
										<p className="text-sm text-muted-foreground">
											{t("priceEachWay")}
										</p>
									)}
								</div>
							</div>
							{quotation!.quotationAdditionalInfo && (
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										{t("additionalInfoCustomer")}
									</p>
									<p className="mt-1 whitespace-pre-wrap text-sm">
										{quotation!.quotationAdditionalInfo}
									</p>
								</div>
							)}
							{quotation!.internalNotes && (
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										{t("internalNotes")}
									</p>
									<p className="mt-1 whitespace-pre-wrap text-sm">
										{quotation!.internalNotes}
									</p>
								</div>
							)}
							{request.status !== "CONFIRMED" && (
								<div className="flex flex-wrap items-start gap-3 border-t pt-4">
									<div className="flex flex-col gap-1">
										<LoadingButton
											variant="outline"
											isLoading={requestDepartureDetails.isPending}
											onClick={() =>
												requestDepartureDetails.mutate({ id: requestId })
											}
										>
											{t("requestDetails")}
										</LoadingButton>
										{request.departureDetailsRequestedAt && (
											<p className="text-xs text-muted-foreground">
												{t("notifiedDate", {
													date: format(
														new Date(request.departureDetailsRequestedAt),
														"d MMM yyyy",
													),
													time: format(
														new Date(request.departureDetailsRequestedAt),
														"HH:mm",
													),
												})}
											</p>
										)}
									</div>
									<Button onClick={() => setConfirmOpen(true)}>
										{t("confirmTrip")}
									</Button>
								</div>
							)}
							<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>{t("confirmModalTitle")}</DialogTitle>
										<DialogDescription>
											{t("confirmModalDesc")}
										</DialogDescription>
									</DialogHeader>
									<DialogFooter className="gap-2">
										<Button
											variant="outline"
											onClick={() => setConfirmOpen(false)}
										>
											{t("confirmModalCancel")}
										</Button>
										<LoadingButton
											isLoading={confirmTrip.isPending}
											onClick={() => confirmTrip.mutate({ id: requestId })}
										>
											{t("confirmModalConfirm")}
										</LoadingButton>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</>
					) : (
						<QuotationForm
							requestId={requestId}
							isRejected={isQuotationRejected}
							quotation={quotation}
							estimateNotice={estimateNotice}
							onSuccess={async () => {
								await utils.tripRequest.getByIdAdmin.invalidate({
									id: requestId,
								});
							}}
						/>
					)}
				</CardContent>
			</Card>

			{/* Messages */}
			<Card>
				<CardContent className="pt-0">
					<TripMessageThread mode="admin" requestId={requestId} />
				</CardContent>
			</Card>

			{/* Events */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">{t("events")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-0">
					{(
						[
							{
								label: t("eventRequestCreated"),
								date: request.createdAt,
								actor: "customer" as const,
							},
							...request.quotations
								.slice()
								.reverse()
								.flatMap((q) => [
									q.notifiedAt
										? {
												label: t("eventQuotationSent"),
												date: q.notifiedAt,
												actor: "admin" as const,
											}
										: null,
									q.respondedAt
										? {
												label:
													q.status === "ACCEPTED"
														? t("eventQuotationAccepted")
														: t("eventQuotationRejected"),
												date: q.respondedAt,
												actor: "customer" as const,
											}
										: null,
								]),
							request.confirmedAt
								? {
										label: t("eventConfirmationSent"),
										date: request.confirmedAt,
										actor: "admin" as const,
									}
								: null,
							request.confirmationViewedAt
								? {
										label: t("eventCustomerSawConfirmation"),
										date: request.confirmationViewedAt,
										actor: "customer" as const,
									}
								: null,
						] as ({
							label: string;
							date: Date;
							actor: "admin" | "customer";
						} | null)[]
					)
						.filter(
							(
								e,
							): e is {
								label: string;
								date: Date;
								actor: "admin" | "customer";
							} => e !== null,
						)
						.sort(
							(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
						)
						.map((event, i) => (
							<div key={i} className="flex items-start gap-3">
								<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />
								<div>
									<p className="text-sm font-medium">
										<span
											className={`mr-1.5 text-xs font-normal ${event.actor === "admin" ? "text-blue-500" : "text-muted-foreground"}`}
										>
											{event.actor === "admin"
												? t("actorAdmin")
												: t("actorCustomer")}
											:
										</span>
										{event.label}
									</p>
									<p className="text-xs text-muted-foreground">
										{format(new Date(event.date), "d MMM yyyy")} {t("at")}{" "}
										{format(new Date(event.date), "HH:mm")}
									</p>
								</div>
							</div>
						))}
				</CardContent>
			</Card>
		</div>
	);
}
