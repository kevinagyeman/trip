"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { ContactDetailsCard } from "@/app/_components/ui/contact-details-card";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PassengersCard } from "@/app/_components/ui/passengers-card";
import { RequestHeaderCard } from "@/app/_components/ui/request-header-card";
import { RouteCardWrapper } from "@/app/_components/ui/route-card-wrapper";
import { RouteDepartureSection } from "@/app/_components/ui/route-departure-section";
import { RoutePickupSection } from "@/app/_components/ui/route-pickup-section";
import { RouteTypeLabel } from "@/app/_components/ui/route-type-label";
import { SectionCard } from "@/app/_components/ui/section-card";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { CustomerDepartureEditDialog } from "./customer-departure-edit-dialog";
import { TripMessageThread } from "./trip-message-thread";

import { buildStatusLabels, QUOTATION_STATUS_COLORS } from "@/lib/trip-utils";

export function PublicTripRequestDetail({ token }: { token: string }) {
	const t = useTranslations("requestDetail");
	const tCommon = useTranslations("common");
	const tMessages = useTranslations("messages");
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const utils = api.useUtils();

	const {
		data: request,
		isLoading,
		isError,
	} = api.tripRequest.getByToken.useQuery({ token });

	const markAsViewed = api.tripRequest.markAsViewed.useMutation();
	useEffect(() => {
		markAsViewed.mutate({ token });
	}, [token]);

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
		},
	});

	if (isLoading)
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	if (isError) return <div>{t("error")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const routes = request.routes;
	const canEdit = !["COMPLETED", "CANCELLED", "CONFIRMED"].includes(
		request.status,
	);

	return (
		<div className="space-y-6">
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

			{/* Quotations */}
			{request.quotations.map((quotation) => (
				<SectionCard
					key={quotation.id}
					title={
						<div className="flex items-center gap-2">
							<span>{t("quotations")}</span>
							<span className={QUOTATION_STATUS_COLORS[quotation.status]}>
								{quotation.status}
							</span>
						</div>
					}
					contentClassName="space-y-4 pt-0"
				>
					<div>
						<p className="text-2xl font-bold">
							{quotation.currency} {quotation.price.toString()}
						</p>
						<p>
							{quotation.isPriceEachWay ? t("priceEachWay") : t("priceTotal")}
						</p>
						{quotation.areCarSeatsIncluded && <p>{t("carSeatsIncluded")}</p>}
					</div>
					{quotation.quotationAdditionalInfo && (
						<div>
							<p className="text-base text-muted-foreground">
								{t("additionalInfoLabel")}
							</p>
							<p className="mt-1 whitespace-pre-wrap text-base">
								{quotation.quotationAdditionalInfo}
							</p>
						</div>
					)}
					{quotation.status === "PENDING" && quotation.notifiedAt && (
						<div className="flex gap-2">
							<LoadingButton
								variant={"default"}
								onClick={() =>
									acceptQuotation.mutate({ id: quotation.id, token })
								}
								isLoading={acceptQuotation.isPending}
								disabled={rejectQuotation.isPending}
							>
								{t("acceptQuotation")}
							</LoadingButton>
							<LoadingButton
								variant="secondary"
								onClick={() =>
									rejectQuotation.mutate({ id: quotation.id, token })
								}
								isLoading={rejectQuotation.isPending}
								disabled={acceptQuotation.isPending}
							>
								{t("rejectQuotation")}
							</LoadingButton>
						</div>
					)}
					{quotation.status === "PENDING" && quotation.notifiedAt && (
						<AlertBanner
							variant="info"
							description={t("editDepartureNotice")}
						/>
					)}
				</SectionCard>
			))}

			{/* Routes */}
			<SectionCard title={t("routes")} contentClassName="pt-0">
				{routes.map((route, i) => (
					<RouteCardWrapper key={i} isLast={i === routes.length - 1}>
						{/* 1 – Route */}
						<div className="px-3 py-3">
							<RouteTypeLabel routeType={route.type} n={i + 1} />
							<p className="text-base">
								<span className="text-muted-foreground mr-2">
									{route.type === "airport_in"
										? t("routeFromAirport")
										: t("routeFrom")}
								</span>
								<span className="font-semibold">{route.pickup}</span>
								<span className="text-muted-foreground mx-2">
									{route.type === "airport_out"
										? t("routeToAirport")
										: t("routeTo")}
								</span>
								<span className="font-semibold">{route.destination}</span>
							</p>
						</div>

						{/* 2 – Departure */}
						<div className="border-t border-dashed">
							<RouteDepartureSection
								routeType={route.type}
								scheduledDate={route.scheduledDate}
								scheduledTime={route.scheduledTime}
								flightNumber={route.flightNumber}
							/>
							{canEdit && (
								<div className="px-3 pb-3">
									<CustomerDepartureEditDialog
										route={route}
										routeIndex={i}
										allRoutes={routes}
										isLoading={updateRoutes.isPending}
										label={`${t("editDeparture")} — ${tCommon("routeN", { n: i + 1 })}`}
										onSave={(routesPayload, options) =>
											updateRoutes.mutate(
												{ token, routes: routesPayload },
												options,
											)
										}
									/>
								</div>
							)}
						</div>

						{/* 3 – Pickup */}
						<div className="border-t border-dashed">
							<RoutePickupSection
								pickup={route.pickup}
								destination={route.destination}
								driverName={route.driverName}
								driverPhone={route.driverPhone}
								beThereAtDate={route.beThereAtDate}
								beThereAtTime={route.beThereAtTime}
								meetingPoint={route.meetingPoint}
								additionalInfo={route.additionalInfo}
							/>
						</div>
					</RouteCardWrapper>
				))}
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

			{/* Messages */}
			<SectionCard title={tMessages("title")} subtitle={t("messagesSubtitle")}>
				<TripMessageThread mode="customer" token={token} />
			</SectionCard>
		</div>
	);
}
