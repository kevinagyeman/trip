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
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TripMessageThread } from "./trip-message-thread";

import { buildStatusLabels, QUOTATION_STATUS_COLORS } from "@/lib/trip-utils";

export function PublicTripRequestDetail({ token }: { token: string }) {
	const t = useTranslations("requestDetail");
	const tMessages = useTranslations("messages");
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
	const hasRejectedQuotation = request.quotations.some(
		(q) => q.status === "REJECTED",
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

			{/* Routes */}
			<SectionCard title={t("routes")} contentClassName="pt-0">
				{routes.map((route, i) => {
					return (
						<RouteCardWrapper key={i} isLast={i === routes.length - 1}>
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

							{/* Departure details */}
							<RouteDepartureSection
								routeType={route.type}
								scheduledDate={route.scheduledDate}
								scheduledTime={route.scheduledTime}
								flightNumber={route.flightNumber}
								pickup={route.pickup}
								destination={route.destination}
								value={
									routeDepartures[i] ?? {
										scheduledDate: "",
										scheduledTime: "",
										flightNumber: "",
									}
								}
								onChange={(field, val) =>
									setRouteDepartures((prev) => {
										const next = [...prev];
										if (next[i]) next[i]![field] = val;
										return next;
									})
								}
								isLoading={updateRoutes.isPending}
								canEdit={canEdit}
								onSave={() => {
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
								afterSave={
									notified && (
										<p className="text-xs text-muted-foreground">
											{t("adminNotified")}
										</p>
									)
								}
							/>

							{/* Pickup info */}
							<RoutePickupSection
								pickup={route.pickup}
								destination={route.destination}
								driverName={route.driverName}
								driverPhone={route.driverPhone}
								beThereAtDate={route.beThereAtDate}
								beThereAtTime={route.beThereAtTime}
								meetingPoint={route.meetingPoint}
								additionalInfo={route.additionalInfo}
								pendingNote={t("pickupTimeNote")}
							/>
						</RouteCardWrapper>
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
							<p className="text-sm">
								{t("priceEachWay")}
							</p>
						)}
						{quotation.areCarSeatsIncluded && (
							<p className="text-sm">
								{t("carSeatsIncluded")}
							</p>
						)}
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
				</SectionCard>
			))}

			{/* Messages */}
			<SectionCard title={tMessages("title")} subtitle={t("messagesSubtitle")}>
				<TripMessageThread mode="customer" token={token} />
			</SectionCard>
		</div>
	);
}
