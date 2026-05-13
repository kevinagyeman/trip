"use client";

import { AdminMessagesCard } from "@/app/_components/admin/admin-messages-card";
import { AdminQuotationCard } from "@/app/_components/admin/admin-quotation-card";
import { InternalNotesCard } from "@/app/_components/admin/internal-notes-card";
import { CollapsibleSection } from "@/app/_components/ui/collapsible-section";
import { ContactDetailsCard } from "@/app/_components/ui/contact-details-card";
import { CopyLinkCard } from "@/app/_components/ui/copy-link-card";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PassengersCard } from "@/app/_components/ui/passengers-card";
import { RequestHeaderCard } from "@/app/_components/ui/request-header-card";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Button } from "@/components/ui/button";
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
import { buildStatusLabels } from "@/lib/trip-utils";
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

	return (
		<div className="space-y-4">
			<Button variant="outline" size="sm" onClick={() => router.back()}>
				{t("backToDashboard")}
			</Button>

			{/* Header card */}
			<RequestHeaderCard
				orderNumber={request.orderNumber}
				firstName={request.firstName}
				lastName={request.lastName}
				status={request.status}
				headerActions={
					<>
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
							/>
						)}
					</>
				}
			/>

			{/* Routes */}
			<SectionCard title={t("routes")} contentClassName="space-y-8 pt-0">
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

			{/* Contact Details */}
			<ContactDetailsCard
				email={request.user?.email ?? request.customerEmail}
				phone={request.phone}
				language={request.language}
				whatsappHref={whatsappHref}
				firstName={request.firstName}
				lastName={request.lastName}
			/>

			{/* Passengers */}
			<PassengersCard
				title={t("passengers")}
				numberOfAdults={request.numberOfAdults}
				areThereChildren={request.areThereChildren}
				numberOfChildren={request.numberOfChildren}
				ageOfChildren={request.ageOfChildren}
				numberOfChildSeats={request.numberOfChildSeats}
				additionalInfo={request.additionalInfo}
			/>

			{/* Quotation */}
			<AdminQuotationCard requestId={requestId} />

			{/* Messages */}
			<AdminMessagesCard requestId={requestId} />

			{/* Internal Notes */}
			<InternalNotesCard
				requestId={requestId}
				initialNotes={request.internalNotes ?? ""}
			/>

			{/* Customer link */}
			<CopyLinkCard
				url={`${window.location.origin}/request/${request.token}`}
				title={t("customerLinkLabel")}
				subtitle={t("customerLinkWarning")}
			/>

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
