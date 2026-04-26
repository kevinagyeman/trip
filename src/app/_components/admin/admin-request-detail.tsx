"use client";

import { QuotationForm } from "@/app/_components/admin/quotation-form";
import { TripMessageThread } from "@/app/_components/trip-requests/trip-message-thread";
import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CalendarPlus } from "lucide-react";
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

function buildICS(params: {
	uid: string;
	summary: string;
	description: string;
	location: string;
	start: string;
	end: string;
}): string {
	return [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Trip Manager//EN",
		"BEGIN:VEVENT",
		`UID:${params.uid}`,
		`DTSTAMP:${toICSDateTime(new Date())}`,
		`DTSTART:${params.start}`,
		`DTEND:${params.end}`,
		`SUMMARY:${params.summary}`,
		`DESCRIPTION:${params.description}`,
		`LOCATION:${params.location}`,
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");
}

function downloadICS(filename: string, content: string) {
	const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
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

import type { Route } from "@/lib/trip-utils";
import {
	buildStatusLabels,
	parseRoutes,
	STATUS_COLORS,
} from "@/lib/trip-utils";

const DEPARTURE_REQUEST_MESSAGES: Record<string, string> = {
	en: "Hi, could you please provide your departure date, time, and flight number (if applicable)? We need these details to confirm your booking.",
	it: "Ciao, potresti fornirci la data di partenza, l'orario e il numero di volo (se applicabile)? Abbiamo bisogno di questi dettagli per confermare la tua prenotazione.",
};

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
	const [adminRouteDepartures, setAdminRouteDepartures] = useState<
		Array<{
			departureDate: string;
			departureTime: string;
			flightNumber: string;
		}>
	>([]);

	useEffect(() => {
		if (request) {
			const parsed = parseRoutes(request.routes);
			setAdminRouteDepartures(
				parsed.map((r) => ({
					departureDate: r.departureDate ?? "",
					departureTime: r.departureTime ?? "",
					flightNumber: r.flightNumber ?? "",
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
	const [prefillMessage, setPrefillMessage] = useState("");
	const [prefillTrigger, setPrefillTrigger] = useState(0);

	const confirmTrip = api.tripRequest.confirmByAdmin.useMutation({
		onSuccess: async () => {
			setConfirmOpen(false);
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
			await utils.tripRequest.getAllRequests.invalidate();
		},
	});

	if (isLoading) return <div>{t("loading")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const routes: Route[] = parseRoutes(request.routes);

	return (
		<div className="space-y-6">
			<Button variant="outline" onClick={() => router.back()}>
				{t("backToDashboard")}
			</Button>

			{/* Customer Information */}
			<div>
				<div>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground">
								#{String(request.orderNumber).padStart(7, "0")}
							</p>
							<h2 className="text-2xl font-bold">
								{request.firstName} {request.lastName}
							</h2>
							<p className="text-sm text-muted-foreground">
								{request.user?.email ?? request.customerEmail}
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
								<Button
									size="sm"
									disabled={updateStatus.isPending}
									onClick={() => {
										updateStatus.mutate(
											{ id: requestId, status: pendingStatus },
											{ onSuccess: () => setPendingStatus(null) },
										);
									}}
								>
									{updateStatus.isPending ? t("saving") : t("saveStatus")}
								</Button>
							)}
						</div>
					</div>
				</div>
				<div className="mt-6 space-y-6">
					{/* Routes */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">{t("routes")}</h3>
						<div className="space-y-2">
							{routes.map((route, i) => (
								<div key={i} className="rounded-lg border-2 text-sm">
									<div className="p-3">
										<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											{t("routeN", { n: i + 1 })}
										</p>
										<div className="flex items-center gap-2 text-base font-semibold">
											<span>{route.pickup}</span>
											<span className="text-muted-foreground">→</span>
											<span>{route.destination}</span>
										</div>
										{(route.departureDate ??
											route.departureTime ??
											route.flightNumber) && (
											<div className="mt-2 flex flex-wrap gap-1.5">
												{(route.departureDate ?? route.departureTime) && (
													<span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
														{route.departureDate &&
															format(
																new Date(route.departureDate),
																"d MMM yyyy",
															)}
														{route.departureDate &&
															route.departureTime &&
															" · "}
														{route.departureTime}
													</span>
												)}
												{route.flightNumber && (
													<span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
														{route.flightNumber}
													</span>
												)}
											</div>
										)}
									</div>
									<div className="border-t border-dashed p-3">
										<p className="mb-2 text-xs font-medium text-muted-foreground">
											{t("routeDepartureDetails")}
										</p>
										<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
											<div className="space-y-1">
												<Label className="text-xs">
													{t("routeDepartureDate")}
												</Label>
												<Input
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
													{t("routeDepartureTime")}
												</Label>
												<Input
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
													placeholder={t("routeFlightNumberPlaceholder")}
													value={adminRouteDepartures[i]?.flightNumber ?? ""}
													onChange={(e) =>
														setAdminRouteDepartures((prev) => {
															const next = [...prev];
															if (next[i])
																next[i]!.flightNumber = e.target.value;
															return next;
														})
													}
												/>
											</div>
										</div>
										<Button
											className="mt-2"
											size="sm"
											variant="outline"
											disabled={updateRoutesByAdmin.isPending}
											onClick={() =>
												updateRoutesByAdmin.mutate({
													id: requestId,
													routes: routes.map((r, j) => ({
														...r,
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
											{updateRoutesByAdmin.isPending
												? t("saving")
												: t("saveRouteDetails")}
										</Button>
										{route.departureDate && (
											<div className="mt-4 border-t pt-3">
												<p className="mb-2 text-xs font-medium text-muted-foreground">
													{t("actions")}
												</p>
												<div className="flex flex-wrap gap-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() => {
															const [hRaw, mRaw] = (
																route.departureTime ?? "00:00"
															)
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
												</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Customer details */}
					<div className="rounded-lg border-2 text-sm divide-y">
						{/* Contact Details */}
						<div className="space-y-1 p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{t("contactDetails")}
							</p>
							<div className="flex flex-wrap gap-x-6 gap-y-1">
								<span>
									<span className="text-muted-foreground">{t("name")}: </span>
									<span className="font-medium">
										{request.firstName} {request.lastName}
									</span>
								</span>
								<span>
									<span className="text-muted-foreground">{t("email")}: </span>
									<span className="font-medium">
										{request.user?.email ?? request.customerEmail}
									</span>
								</span>
								<span>
									<span className="text-muted-foreground">{t("phone")}: </span>
									<span className="font-medium">{request.phone}</span>
								</span>
							</div>
						</div>

						{/* Passengers */}
						<div className="space-y-1 p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{t("passengers")}
							</p>
							<div className="flex flex-wrap gap-x-6 gap-y-1">
								<span>
									<span className="text-muted-foreground">{t("adults")}: </span>
									<span className="font-medium">{request.numberOfAdults}</span>
								</span>
								{request.areThereChildren &&
									request.numberOfChildren !== null && (
										<span>
											<span className="text-muted-foreground">
												{t("numberOfChildren")}:{" "}
											</span>
											<span className="font-medium">
												{request.numberOfChildren}
											</span>
										</span>
									)}
								{request.areThereChildren && request.ageOfChildren && (
									<span>
										<span className="text-muted-foreground">
											{t("agesOfChildren")}:{" "}
										</span>
										<span className="font-medium">{request.ageOfChildren}</span>
									</span>
								)}
								{request.areThereChildren &&
									request.numberOfChildSeats !== null && (
										<span>
											<span className="text-muted-foreground">
												{t("childSeatsNeeded")}:{" "}
											</span>
											<span className="font-medium">
												{request.numberOfChildSeats}
											</span>
										</span>
									)}
							</div>
						</div>

						{/* Preferences */}
						<div className="space-y-1 p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{t("preferences")}
							</p>
							<div className="flex flex-wrap gap-x-6 gap-y-1">
								<span>
									<span className="text-muted-foreground">
										{t("language")}:{" "}
									</span>
									<span className="font-medium">
										{LANGUAGE_LABELS[request.language] ?? request.language}
									</span>
								</span>
								<span>
									<span className="text-muted-foreground">
										{t("created")}:{" "}
									</span>
									<span className="font-medium">
										{format(new Date(request.createdAt), "PPP")}
									</span>
								</span>
							</div>
							{request.additionalInfo && (
								<span>
									<span className="text-muted-foreground">
										{t("additionalInformation")}:{" "}
									</span>
									<span className="font-medium">{request.additionalInfo}</span>
								</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Quotation */}
			{(() => {
				const quotation = request.quotations[0];
				const isAccepted = quotation?.status === "ACCEPTED";
				const isRejected = quotation?.status === "REJECTED";
				return (
					<div className="space-y-4">
						<h2 className="text-xl font-bold">{t("quotation")}</h2>
						<Card>
							<CardContent className="space-y-4">
								{isAccepted ? (
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
											<Badge className="bg-green-500">
												{t("statusAccepted")}
											</Badge>
										</div>
										{quotation!.respondedAt && (
											<p className="text-sm text-muted-foreground">
												{t("respondedDate", {
													date: format(new Date(quotation!.respondedAt), "PPP"),
												})}
											</p>
										)}
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
										{/* Confirmed banner or action buttons */}
										{request.status === "CONFIRMED" ? (
											<AlertBanner
												variant="success"
												title={t("tripConfirmedTitle")}
												description={t("tripConfirmedDesc")}
											/>
										) : (
											<div className="flex flex-wrap items-start gap-3 border-t pt-4">
												<Button onClick={() => setConfirmOpen(true)}>
													{t("confirmTrip")}
												</Button>
											</div>
										)}

										{/* Confirm Trip Dialog */}
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
													<Button
														disabled={confirmTrip.isPending}
														onClick={() =>
															confirmTrip.mutate({ id: requestId })
														}
													>
														{confirmTrip.isPending
															? t("confirming")
															: t("confirmModalConfirm")}
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</>
								) : (
									<QuotationForm
										requestId={requestId}
										isRejected={isRejected}
										quotation={quotation}
										estimateNotice={(() => {
											try {
												const n = JSON.parse(
													request.company?.estimateNotice ?? "{}",
												) as Record<string, string>;
												return n[request.language] ?? n["en"] ?? "";
											} catch {
												return "";
											}
										})()}
										onSuccess={async () => {
											await utils.tripRequest.getByIdAdmin.invalidate({
												id: requestId,
											});
										}}
									/>
								)}
							</CardContent>
						</Card>
					</div>
				);
			})()}

			{/* Message Thread */}
			<Card>
				<CardContent>
					<TripMessageThread
						mode="admin"
						requestId={requestId}
						prefillMessage={prefillMessage}
						prefillTrigger={prefillTrigger}
					/>
					<div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
						<p className="w-full text-xs text-muted-foreground">
							{t("quickReplies")}
						</p>
						<Button
							size="sm"
							variant="outline"
							onClick={() => {
								setPrefillMessage(
									DEPARTURE_REQUEST_MESSAGES[request.language] ??
										DEPARTURE_REQUEST_MESSAGES.en!,
								);
								setPrefillTrigger((n) => n + 1);
							}}
						>
							{t("requestDetails")}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
