"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LANGUAGE_LABELS } from "@/lib/quick-fill";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TripMessageThread } from "./trip-message-thread";

import type { Route } from "@/lib/trip-utils";
import {
	buildStatusLabels,
	parseRoutes,
	QUOTATION_STATUS_COLORS,
	STATUS_COLORS,
} from "@/lib/trip-utils";

export function PublicTripRequestDetail({ token }: { token: string }) {
	const t = useTranslations("requestDetail");
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const utils = api.useUtils();

	const {
		data: request,
		isLoading,
		isError,
	} = api.tripRequest.getByToken.useQuery({
		token,
	});

	const [routeDepartures, setRouteDepartures] = useState<
		Array<{
			departureDate: string;
			departureTime: string;
			flightNumber: string;
		}>
	>([]);

	useEffect(() => {
		if (request) {
			const parsed = parseRoutes(request.routes);
			setRouteDepartures(
				parsed.map((r) => ({
					departureDate: r.departureDate ?? "",
					departureTime: r.departureTime ?? "",
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

	const routes: Route[] = parseRoutes(request.routes);
	const canEdit = !["COMPLETED", "CANCELLED", "CONFIRMED"].includes(
		request.status,
	);

	return (
		<div className="space-y-6">
			{/* Trip confirmed banner */}
			{request.status === "CONFIRMED" && (
				<AlertBanner
					variant="success"
					title={t("tripConfirmedTitle")}
					description={t("tripConfirmedDesc")}
				/>
			)}

			{/* Persistent email notification notice */}
			<AlertBanner
				variant="info"
				description={t("emailNotice", { email: request.fromEmail })}
			/>

			{/* Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<p className="text-xs font-medium text-muted-foreground">
						#{String(request.orderNumber).padStart(7, "0")}
					</p>
					<h2 className="text-2xl font-bold">
						{request.firstName} {request.lastName}
					</h2>
					<div className="space-y-0.5">
						{routes.map((route, i) => (
							<p key={i} className="text-sm text-muted-foreground">
								{route.pickup} → {route.destination}
							</p>
						))}
					</div>
				</div>
				<Badge className={STATUS_COLORS[request.status]}>
					{statusLabels[request.status] ?? request.status}
				</Badge>
			</div>

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
								{route.type === "airport" && (
									<span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
										<Plane className="h-3 w-3" />
										{t("transferTypeAirport")}
									</span>
								)}
								{(route.departureDate ??
									route.departureTime ??
									route.flightNumber) && (
									<div className="mt-2 flex flex-wrap gap-1.5">
										{(route.departureDate ?? route.departureTime) && (
											<span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
												{route.departureDate &&
													format(new Date(route.departureDate), "d MMM yyyy")}
												{route.departureDate && route.departureTime && " · "}
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

							{canEdit && (
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
												value={routeDepartures[i]?.departureDate ?? ""}
												onChange={(e) =>
													setRouteDepartures((prev) => {
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
												value={routeDepartures[i]?.departureTime ?? ""}
												onChange={(e) =>
													setRouteDepartures((prev) => {
														const next = [...prev];
														if (next[i])
															next[i]!.departureTime = e.target.value;
														return next;
													})
												}
											/>
										</div>
										{route.type === "airport" && (
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
									<div className="mt-2 flex items-center gap-3">
										<Button
											size="sm"
											variant="outline"
											disabled={updateRoutes.isPending}
											onClick={() => {
												setNotified(false);
												updateRoutes.mutate({
													token,
													routes: routes.map((r, j) => ({
														...r,
														departureDate:
															routeDepartures[j]?.departureDate || undefined,
														departureTime:
															routeDepartures[j]?.departureTime || undefined,
														flightNumber:
															routeDepartures[j]?.flightNumber || undefined,
													})),
												});
											}}
										>
											{updateRoutes.isPending
												? t("saving")
												: t("saveRouteDetails")}
										</Button>
										{notified && (
											<p className="text-xs text-muted-foreground">
												{t("adminNotified")}
											</p>
										)}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Contact / Passengers / Preferences */}
			<div className="rounded-lg border-2 text-sm divide-y">
				<div className="space-y-1 p-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{t("contactDetails")}
					</p>
					<div className="flex flex-wrap gap-x-6 gap-y-1">
						<span>
							<span className="text-muted-foreground">{t("email")}: </span>
							<span className="font-medium">{request.customerEmail}</span>
						</span>
						<span>
							<span className="text-muted-foreground">{t("phone")}: </span>
							<span className="font-medium">{request.phone}</span>
						</span>
					</div>
				</div>
				<div className="space-y-1 p-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{t("passengers")}
					</p>
					<div className="flex flex-wrap gap-x-6 gap-y-1">
						<span>
							<span className="text-muted-foreground">{t("adults")}: </span>
							<span className="font-medium">{request.numberOfAdults}</span>
						</span>
						{request.areThereChildren && request.numberOfChildren !== null && (
							<span>
								<span className="text-muted-foreground">
									{t("numberOfChildren")}:{" "}
								</span>
								<span className="font-medium">{request.numberOfChildren}</span>
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
				<div className="space-y-1 p-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{t("preferences")}
					</p>
					<div className="flex flex-wrap gap-x-6 gap-y-1">
						<span>
							<span className="text-muted-foreground">{t("language")}: </span>
							<span className="font-medium">
								{LANGUAGE_LABELS[request.language] ?? request.language}
							</span>
						</span>
						<span>
							<span className="text-muted-foreground">{t("created")}: </span>
							<span className="font-medium">
								{format(new Date(request.createdAt), "PPP")}
							</span>
						</span>
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

			{/* Quotations */}
			{request.quotations.length === 0 && (
				<AlertBanner
					variant="info"
					title={t("quotationPendingTitle")}
					description={t("quotationPendingDesc")}
				/>
			)}
			{request.quotations.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-xl font-bold">{t("quotations")}</h2>
					{request.quotations.map((quotation) => (
						<Card key={quotation.id}>
							<CardContent className="space-y-4">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-2xl font-bold">
											{quotation.currency} {quotation.price.toString()}
										</p>
										{quotation.isPriceEachWay && (
											<p className="text-sm text-muted-foreground">
												{t("priceEachWay")}
											</p>
										)}
									</div>
									<Badge className={QUOTATION_STATUS_COLORS[quotation.status]}>
										{quotation.status}
									</Badge>
								</div>
								{quotation.areCarSeatsIncluded && (
									<div className="rounded-lg bg-muted p-3">
										<p className="text-sm font-medium">
											{t("carSeatsIncluded")}
										</p>
									</div>
								)}
								{quotation.quotationAdditionalInfo && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("additionalInfoLabel")}
										</p>
										<p className="mt-1 whitespace-pre-wrap">
											{quotation.quotationAdditionalInfo}
										</p>
									</div>
								)}
								{quotation.notifiedAt && (
									<p className="text-sm text-muted-foreground">
										{t("notifiedDate", {
											date: format(new Date(quotation.notifiedAt), "PPP"),
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
								{quotation.status === "REJECTED" && (
									<AlertBanner
										variant="error"
										title={t("quotationRejected")}
										description={t("quotationRejectedDesc")}
									/>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Message Thread */}
			<Card>
				<CardContent>
					<TripMessageThread mode="customer" token={token} />
				</CardContent>
			</Card>
		</div>
	);
}
