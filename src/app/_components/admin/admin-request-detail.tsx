"use client";

import { AdminMessagesCard } from "@/app/_components/admin/admin-messages-card";
import { PickupAdminBlock } from "@/app/_components/admin/admin-pickup-block";
import { AdminQuotationCard } from "@/app/_components/admin/admin-quotation-card";
import { AdminRouteEditDialog } from "@/app/_components/admin/admin-route-edit-dialog";
import { EventsTimeline } from "@/app/_components/admin/events-timeline";
import { InternalNotesCard } from "@/app/_components/admin/internal-notes-card";
import { ContactDetailsCard } from "@/app/_components/ui/contact-details-card";
import { CopyLinkCard } from "@/app/_components/ui/copy-link-card";
import CustomSelect from "@/app/_components/ui/custom-select";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PassengersCard } from "@/app/_components/ui/passengers-card";
import { RequestHeaderCard } from "@/app/_components/ui/request-header-card";
import { RouteCardWrapper } from "@/app/_components/ui/route-card-wrapper";
import { RouteDepartureSection } from "@/app/_components/ui/route-departure-section";
import {
	RouteFromToLabel,
	RouteTypeLabel,
} from "@/app/_components/ui/route-type-label";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Button } from "@/components/ui/button";
import { isRequestLocked } from "@/lib/trip-utils";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { TripRequestStatus } from "../../../../generated/prisma";

export function AdminRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
	const t = useTranslations("adminDetail");
	const tCommon = useTranslations("common");
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

	const handlePickupSave: typeof updateRoutesByAdmin.mutate = (
		input,
		options,
	) => {
		updateRoutesByAdmin.mutate(input, {
			...options,
			onSuccess: (...args) => {
				options?.onSuccess?.(...args);
				toast.success(tCommon("toastEmailSent"));
			},
		});
	};

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
	const locked = isRequestLocked(request.status);

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
						{!locked && (
							<CustomSelect
								value={pendingStatus ?? ""}
								onValueChange={(v) => setPendingStatus(v as TripRequestStatus)}
								placeholder={t("markAs")}
								options={[
									{ value: "COMPLETED", label: t("statusCompleted") },
									{ value: "CANCELLED", label: t("statusCancelled") },
								]}
							/>
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

			{/* Quotation */}
			<AdminQuotationCard requestId={requestId} request={request} />

			{/* Routes */}
			<SectionCard title={t("routes")} contentClassName="pt-0">
				{routes.map((route, i) => (
					<RouteCardWrapper key={i} isLast={i === routes.length - 1}>
						{/* 1 – Route */}
						<div className="p-3">
							<RouteTypeLabel routeType={route.type} n={i + 1} />
							<RouteFromToLabel
								routeType={route.type}
								pickup={route.pickup}
								destination={route.destination}
							/>
						</div>

						{/* 2 – Departure */}
						<div className="border-t border-dashed p-3 space-y-3">
							<RouteDepartureSection
								routeType={route.type}
								scheduledDate={route.scheduledDate}
								scheduledTime={route.scheduledTime}
								flightNumber={route.flightNumber}
								pickup={route.pickup}
								destination={route.destination}
								showCalendar={!locked}
								showCopyFlight
							/>

							{!locked && (
								<AdminRouteEditDialog
									requestId={requestId}
									route={route}
									routeIndex={i}
									allRoutes={routes}
									isLoading={updateRoutesByAdmin.isPending}
									label={`${t("editRoute")} — ${tCommon("routeN", { n: i + 1 })}`}
									onSave={updateRoutesByAdmin.mutate}
								/>
							)}
						</div>

						{/* 3 – Pickup */}
						{["CONFIRMED", "COMPLETED", "CANCELLED"].includes(request.status) &&
							!(
								locked &&
								!(route.meetingPoint ?? route.beThereAtDate ?? route.driverName)
							) && (
								<div className="border-t border-dashed p-3 space-y-3">
									<PickupAdminBlock
										requestId={requestId}
										route={route}
										routeIndex={i}
										allRoutes={routes}
										drivers={drivers}
										isLoading={updateRoutesByAdmin.isPending}
										onSave={handlePickupSave}
										warningTitle={tCommon("pickupAdminWarningTitle")}
										warningText={tCommon("pickupAdminTimeNote")}
										disabled={locked}
									/>
								</div>
							)}
					</RouteCardWrapper>
				))}
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

			{/* Messages */}
			<AdminMessagesCard requestId={requestId} disabled={locked} />

			{/* Internal Notes */}
			<InternalNotesCard
				requestId={requestId}
				initialNotes={request.internalNotes ?? ""}
			/>

			{/* Customer link */}
			<CopyLinkCard
				url={`/request/${request.token}`}
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
