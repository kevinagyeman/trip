"use client";

import { AdminMessagesCard } from "@/app/_components/admin/admin-messages-card";
import { AdminQuotationCard } from "@/app/_components/admin/admin-quotation-card";
import { EventsTimeline } from "@/app/_components/admin/events-timeline";
import { InternalNotesCard } from "@/app/_components/admin/internal-notes-card";
import { ContactDetailsCard } from "@/app/_components/ui/contact-details-card";
import { CopyLinkCard } from "@/app/_components/ui/copy-link-card";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PassengersCard } from "@/app/_components/ui/passengers-card";
import { RequestHeaderCard } from "@/app/_components/ui/request-header-card";
import { RouteCardWrapper } from "@/app/_components/ui/route-card-wrapper";
import { RouteDepartureSection } from "@/app/_components/ui/route-departure-section";
import { RoutePickupSection } from "@/app/_components/ui/route-pickup-section";
import { RouteTypeLabel } from "@/app/_components/ui/route-type-label";
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
import { buildStatusLabels } from "@/lib/trip-utils";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Loader2, MoveRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { TripRequestStatus } from "../../../../generated/prisma";

export function AdminRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
	const t = useTranslations("adminDetail");
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const utils = api.useUtils();

	const { data: request, isLoading } = api.tripRequest.getByIdAdmin.useQuery({
		id: requestId,
	});

	const markAsViewedByAdmin = api.tripRequest.markAsViewedByAdmin.useMutation();
	useEffect(() => {
		markAsViewedByAdmin.mutate({ id: requestId });
	}, [requestId]);

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

	if (isLoading)
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
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
			<SectionCard title={t("routes")} contentClassName="pt-0">
				{routes.map((route, i) => {
					const hasDepInfo = !!(route.scheduledDate ?? route.scheduledTime);
					const hasPickupInfo = !!(route.meetingPoint ?? route.driverName);
					return (
						<RouteCardWrapper key={i} isLast={i === routes.length - 1}>
							{/* Route header */}
							<div className="flex items-start justify-between gap-3 p-3">
								<div className="w-full space-y-2">
									<RouteTypeLabel routeType={route.type} n={i + 1} />
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
										<MoveRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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

							{/* Departure details */}
							<RouteDepartureSection
								routeType={route.type}
								scheduledDate={route.scheduledDate}
								scheduledTime={route.scheduledTime}
								flightNumber={route.flightNumber}
								pickup={route.pickup}
								destination={route.destination}
								value={
									adminRouteDepartures[i] ?? {
										scheduledDate: "",
										scheduledTime: "",
										flightNumber: "",
									}
								}
								onChange={(field, val) =>
									setAdminRouteDepartures((prev) => {
										const next = [...prev];
										if (next[i]) next[i]![field] = val;
										return next;
									})
								}
								isLoading={updateRoutesByAdmin.isPending}
								onSave={() =>
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
							/>

							{/* Pickup info — only when CONFIRMED */}
							{request.status === "CONFIRMED" && (
								<RoutePickupSection
									pickup={route.pickup}
									destination={route.destination}
									driverName={route.driverName}
									driverPhone={route.driverPhone}
									beThereAtDate={route.beThereAtDate}
									beThereAtTime={route.beThereAtTime}
									meetingPoint={route.meetingPoint}
									additionalInfo={route.additionalInfo}
									canEdit
									value={adminPickupInfos[i]}
									onChange={(field, val) =>
										setAdminPickupInfos((prev) => {
											const next = [...prev];
											if (next[i]) next[i]![field] = val;
											return next;
										})
									}
									onSave={() =>
										updateRoutesByAdmin.mutate({
											id: requestId,
											notify: true,
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
									isLoading={updateRoutesByAdmin.isPending}
									drivers={drivers}
									notifiedAt={request.pickupInfoNotifiedAt}
									saveLabel={t("saveAndNotifyCustomer")}
								/>
							)}
						</RouteCardWrapper>
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
			<EventsTimeline
				events={request.events}
				adminViewedAt={request.adminViewedAt}
			/>
		</div>
	);
}
