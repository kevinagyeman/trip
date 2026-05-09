"use client";

import { QuotationForm } from "@/app/_components/admin/quotation-form";
import { TripMessageThread } from "@/app/_components/trip-requests/trip-message-thread";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/app/_components/ui/section-card";
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
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleSection } from "@/app/_components/ui/collapsible-section";
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

import { buildStatusLabels, STATUS_COLORS } from "@/lib/trip-utils";

function InternalNotesCard({
	requestId,
	initialNotes,
}: {
	requestId: string;
	initialNotes: string;
}) {
	const t = useTranslations("adminDetail");
	const utils = api.useUtils();
	const [notes, setNotes] = useState(initialNotes);
	const update = api.tripRequest.updateInternalNotes.useMutation({
		onSuccess: () =>
			utils.tripRequest.getByIdAdmin.invalidate({ id: requestId }),
	});

	return (
		<SectionCard title={t("internalNotes")} contentClassName="space-y-2 pt-0">
			<Textarea
				rows={3}
				placeholder={t("internalNotesPlaceholder")}
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
			/>
			<LoadingButton
				size="sm"
				variant="outline"
				isLoading={update.isPending}
				onClick={() => update.mutate({ id: requestId, internalNotes: notes })}
			>
				{t("saveNotes")}
			</LoadingButton>
		</SectionCard>
	);
}

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
			scheduledDate: string;
			scheduledTime: string;
			flightNumber: string;
		}>
	>([]);

	const [adminPickupInfos, setAdminPickupInfos] = useState<
		Array<{
			meetingPoint: string;
			beThereAtDate: string;
			beThereAtTime: string;
			driverName: string;
			driverPhone: string;
			additionalInfo: string;
		}>
	>([]);

	useEffect(() => {
		if (request) {
			setAdminRoutePlaces(
				request.routes.map((r) => ({
					pickup: r.pickup,
					destination: r.destination,
				})),
			);
			setAdminRouteDepartures(
				request.routes.map((r) => ({
					scheduledDate: r.scheduledDate ?? "",
					scheduledTime: r.scheduledTime ?? "",
					flightNumber: r.flightNumber ?? "",
				})),
			);
			setAdminPickupInfos(
				request.routes.map((r) => ({
					meetingPoint: r.meetingPoint ?? "",
					beThereAtDate: r.beThereAtDate ?? "",
					beThereAtTime: r.beThereAtTime ?? "",
					driverName: r.driverName ?? "",
					driverPhone: r.driverPhone ?? "",
					additionalInfo: r.additionalInfo ?? "",
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

	const { data: drivers = [] } = api.driver.getAll.useQuery();

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

	const routes = request.routes;

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
			<SectionCard>
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
			</SectionCard>

			{/* Routes */}
			<SectionCard title={t("routes")} contentClassName="space-y-16 pt-0">
				{routes.map((route, i) => {
					const hasDepInfo = !!(route.scheduledDate ?? route.scheduledTime);
					const hasPickupInfo = !!(route.meetingPoint ?? route.driverName);
					return (
						<div key={i} className="rounded-lg border text-sm">
							{/* Route header */}
							<div className="flex items-start justify-between gap-3 p-3">
								<div className="w-full space-y-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										{t("routeN", { n: i + 1 })}
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

							{/* Departure details form */}
							<CollapsibleSection
								editLabel={t("edit")}
								title={
									(route.scheduledDate ??
									route.scheduledTime ??
									route.flightNumber) ? (
										<span className="flex flex-wrap items-center gap-2">
											<span className="text-muted-foreground">
												{route.type === "airport_in"
													? t("departureScheduledLanding")
													: route.type === "airport_out" ||
															route.type === "airport"
														? t("departureScheduledTakeoff")
														: t("departureScheduledArrival")}
											</span>
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
												<span className="font-medium text-foreground">
													{route.flightNumber}
												</span>
											)}
											{route.scheduledDate && (
												<Button
													size="sm"
													variant="ghost"
													className="h-5 px-1.5 text-xs"
													onClick={(e) => {
														e.stopPropagation();
														const [hRaw, mRaw] = (
															route.scheduledTime ?? "00:00"
														)
															.split(":")
															.map(Number);
														const endH = ((hRaw ?? 0) + 1) % 24;
														window.open(
															googleCalendarUrl({
																summary: `${t("routeN", { n: i + 1 })}: ${route.pickup} → ${route.destination}`,
																description: route.flightNumber
																	? `${t("routeFlightNumber")}: ${route.flightNumber}`
																	: "",
																location: route.pickup,
																start: toICSDateTime(
																	new Date(route.scheduledDate!),
																	route.scheduledTime,
																),
																end: toICSDateTime(
																	new Date(route.scheduledDate!),
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
											<span className="text-muted-foreground">
												{route.type === "airport_in"
													? t("departureScheduledLanding")
													: route.type === "airport_out" ||
															route.type === "airport"
														? t("departureScheduledTakeoff")
														: t("departureScheduledArrival")}
											</span>
											<span className="text-muted-foreground">—</span>
										</span>
									)
								}
							>
								<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
									<div className="space-y-1">
										<Label className="text-xs">
											{route.type === "airport_out" || route.type === "airport"
												? t("routeFlightDate")
												: route.type === "airport_in"
													? t("routeLandingDate")
													: t("routeArrivalDate")}
										</Label>
										<Input
											className="h-7 text-xs"
											type="date"
											value={adminRouteDepartures[i]?.scheduledDate ?? ""}
											onChange={(e) =>
												setAdminRouteDepartures((prev) => {
													const next = [...prev];
													if (next[i]) next[i]!.scheduledDate = e.target.value;
													return next;
												})
											}
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">
											{route.type === "airport_out" || route.type === "airport"
												? t("routeFlightTime")
												: route.type === "airport_in"
													? t("routeLandingTime")
													: t("routeArrivalTime")}
										</Label>
										<Input
											className="h-7 text-xs"
											type="time"
											value={adminRouteDepartures[i]?.scheduledTime ?? ""}
											onChange={(e) =>
												setAdminRouteDepartures((prev) => {
													const next = [...prev];
													if (next[i]) next[i]!.scheduledTime = e.target.value;
													return next;
												})
											}
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">{t("routeFlightNumber")}</Label>
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
													pickup: adminRoutePlaces[j]?.pickup ?? r.pickup,
													destination:
														adminRoutePlaces[j]?.destination ?? r.destination,
													type: r.type ?? undefined,
													scheduledDate:
														adminRouteDepartures[j]?.scheduledDate || undefined,
													scheduledTime:
														adminRouteDepartures[j]?.scheduledTime || undefined,
													flightNumber:
														adminRouteDepartures[j]?.flightNumber || undefined,
												})),
											})
										}
									>
										{t("saveRouteDetails")}
									</LoadingButton>
								</div>
							</CollapsibleSection>

							{/* Pickup info — only when CONFIRMED */}
							{request.status === "CONFIRMED" && (
								<CollapsibleSection
									editLabel={t("edit")}
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
														className="h-5 px-1.5 text-xs"
														onClick={(e) => {
															e.stopPropagation();
															const date = new Date(route.beThereAtDate!);
															const timeStr = route.beThereAtTime ?? "00:00";
															const [h, m] = timeStr.split(":").map(Number);
															const end = new Date(date);
															end.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
															window.open(
																googleCalendarUrl({
																	summary: `${route.pickup} → ${route.destination}`,
																	description: [
																		route.driverName &&
																			`${t("pickupInfoDriverName")}: ${route.driverName}`,
																		route.driverPhone &&
																			`${t("pickupInfoDriverPhone")}: ${route.driverPhone}`,
																	]
																		.filter(Boolean)
																		.join("\n"),
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
									{/* Driver quick-select */}
									{drivers.length > 0 && (
										<div className="mb-3 space-y-1">
											<Label className="text-xs">
												{t("pickupInfoSelectDriver")}
											</Label>
											<Select
												onValueChange={(driverId) => {
													const d = drivers.find((dr) => dr.id === driverId);
													if (!d) return;
													setAdminPickupInfos((prev) => {
														const next = [...prev];
														if (next[i]) {
															next[i]!.driverName = `${d.name} ${d.surname}`;
															next[i]!.driverPhone = d.phone;
														}
														return next;
													});
												}}
											>
												<SelectTrigger className="h-7 text-xs">
													<SelectValue
														placeholder={t("pickupInfoSelectDriverPlaceholder")}
													/>
												</SelectTrigger>
												<SelectContent>
													{drivers.map((d) => (
														<SelectItem key={d.id} value={d.id}>
															{d.name} {d.surname}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}

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
														if (next[i]) next[i]!.meetingPoint = e.target.value;
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
														if (next[i]) next[i]!.driverPhone = e.target.value;
														return next;
													})
												}
											/>
										</div>
										<div className="space-y-1 sm:col-span-2">
											<Label className="text-xs">
												{t("pickupInfoAdditionalInfo")}
											</Label>
											<Textarea
												className="text-xs"
												rows={3}
												placeholder={t("pickupInfoAdditionalInfoPlaceholder")}
												value={adminPickupInfos[i]?.additionalInfo ?? ""}
												onChange={(e) =>
													setAdminPickupInfos((prev) => {
														const next = [...prev];
														if (next[i])
															next[i]!.additionalInfo = e.target.value;
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
														pickup: adminRoutePlaces[j]?.pickup ?? r.pickup,
														destination:
															adminRoutePlaces[j]?.destination ?? r.destination,
														type: r.type ?? undefined,
														scheduledDate:
															adminRouteDepartures[j]?.scheduledDate ||
															undefined,
														scheduledTime:
															adminRouteDepartures[j]?.scheduledTime ||
															undefined,
														flightNumber:
															adminRouteDepartures[j]?.flightNumber ||
															undefined,
														meetingPoint:
															adminPickupInfos[j]?.meetingPoint || undefined,
														beThereAtDate:
															adminPickupInfos[j]?.beThereAtDate || undefined,
														beThereAtTime:
															adminPickupInfos[j]?.beThereAtTime || undefined,
														driverName:
															adminPickupInfos[j]?.driverName || undefined,
														driverPhone:
															adminPickupInfos[j]?.driverPhone || undefined,
														additionalInfo:
															adminPickupInfos[j]?.additionalInfo || undefined,
													})),
												})
											}
										>
											{t("saveAndNotifyCustomer")}
										</LoadingButton>
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
								</CollapsibleSection>
							)}
						</div>
					);
				})}
			</SectionCard>

			{/* Passengers */}
			<SectionCard
				title={t("passengers")}
				contentClassName="space-y-1.5 pt-0 text-sm"
			>
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
			</SectionCard>

			{/* Quotation */}
			<SectionCard
				title={t("quotation")}
				headerAction={
					quotation ? (
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
					) : undefined
				}
				contentClassName="space-y-4 pt-0"
			>
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
						{request.status !== "CONFIRMED" && (
							<div className="flex flex-wrap items-start gap-3">
								<div className="flex flex-col gap-1">
									<LoadingButton
										size="sm"
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
								<Button size="sm" onClick={() => setConfirmOpen(true)}>
									{t("confirmTrip")}
								</Button>
							</div>
						)}
						<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>{t("confirmModalTitle")}</DialogTitle>
									<DialogDescription>{t("confirmModalDesc")}</DialogDescription>
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
			</SectionCard>

			{/* Internal Notes */}
			<InternalNotesCard
				requestId={requestId}
				initialNotes={request.internalNotes ?? ""}
			/>

			{/* Messages */}
			<SectionCard contentClassName="pt-0">
				<TripMessageThread mode="admin" requestId={requestId} />
			</SectionCard>

			{/* Events */}
			<SectionCard title={t("events")} contentClassName="space-y-3 pt-0">
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
			</SectionCard>
		</div>
	);
}
