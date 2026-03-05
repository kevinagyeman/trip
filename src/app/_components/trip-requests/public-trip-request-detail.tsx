"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TripMessageThread } from "./trip-message-thread";

type Route = {
	pickup: string;
	destination: string;
	departureDate?: string;
	departureTime?: string;
	flightNumber?: string;
};

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-500",
	QUOTED: "bg-blue-500",
	ACCEPTED: "bg-green-500",
	REJECTED: "bg-red-500",
	COMPLETED: "bg-gray-500",
	CANCELLED: "bg-gray-400",
};

const quotationStatusColors: Record<string, string> = {
	DRAFT: "bg-gray-400",
	SENT: "bg-blue-500",
	ACCEPTED: "bg-green-500",
	REJECTED: "bg-red-500",
};

export function PublicTripRequestDetail({ token }: { token: string }) {
	const t = useTranslations("requestDetail");
	const utils = api.useUtils();
	const [routeEdits, setRouteEdits] = useState<Route[] | null>(null);

	const { data: request, isLoading } = api.tripRequest.getByToken.useQuery({
		token,
	});

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
			setRouteEdits(null);
		},
	});

	if (isLoading) return <div>{t("loading")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const routes: Route[] = JSON.parse(request.routes) as Route[];
	const firstRoute = routes[0]!;
	const editableRoutes = routeEdits ?? routes;

	return (
		<div className="space-y-6">
			{/* Persistent email notification notice */}
			{request && (
				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-950/30">
					<p className="text-blue-800 dark:text-blue-300">
						{t("emailNotice", { email: request.fromEmail })}
					</p>
				</div>
			)}

			{/* Main Request Information */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-2xl">
								{request.firstName} {request.lastName}
								<span className="ml-2 text-base font-normal text-muted-foreground">
									#{String(request.orderNumber).padStart(7, "0")}
								</span>
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								{firstRoute.pickup} → {firstRoute.destination}
								{routes.length > 1 && ` +${routes.length - 1} more`}
							</p>
						</div>
						<div className="flex gap-2">
							<Badge className={statusColors[request.status]}>
								{request.status}
							</Badge>
							{request.isConfirmed && (
								<Badge variant="outline">{t("confirmed")}</Badge>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Routes */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">{t("routes")}</h3>
						<div className="space-y-3">
							{editableRoutes.map((route, i) => (
								<div
									key={i}
									className="rounded-lg border p-3 text-sm space-y-3"
								>
									<p className="text-xs font-medium text-muted-foreground">
										{t("routeN", { n: i + 1 })}
									</p>
									<p>
										<span className="text-muted-foreground">
											{t("pickup")}:{" "}
										</span>
										<span className="font-medium">{route.pickup}</span>
									</p>
									<p>
										<span className="text-muted-foreground">
											{t("destination")}:{" "}
										</span>
										<span className="font-medium">{route.destination}</span>
									</p>
									{/* Editable departure details */}
									<div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
										<div className="space-y-1">
											<Label className="text-xs">
												{t("routeDepartureDate")}
											</Label>
											<Input
												type="date"
												value={route.departureDate ?? ""}
												onChange={(e) => {
													const updated = [...editableRoutes];
													updated[i] = {
														...updated[i]!,
														departureDate: e.target.value || undefined,
													};
													setRouteEdits(updated);
												}}
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">
												{t("routeDepartureTime")}
											</Label>
											<Input
												type="time"
												value={route.departureTime ?? ""}
												onChange={(e) => {
													const updated = [...editableRoutes];
													updated[i] = {
														...updated[i]!,
														departureTime: e.target.value || undefined,
													};
													setRouteEdits(updated);
												}}
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">
												{t("routeFlightNumber")}
											</Label>
											<Input
												placeholder={t("routeFlightNumberPlaceholder")}
												value={route.flightNumber ?? ""}
												onChange={(e) => {
													const updated = [...editableRoutes];
													updated[i] = {
														...updated[i]!,
														flightNumber: e.target.value || undefined,
													};
													setRouteEdits(updated);
												}}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
						{routeEdits && (
							<Button
								className="mt-3"
								size="sm"
								disabled={updateRoutes.isPending}
								onClick={() =>
									updateRoutes.mutate({ token, routes: routeEdits })
								}
							>
								{updateRoutes.isPending ? t("saving") : t("saveRouteDetails")}
							</Button>
						)}
					</div>

					{/* Travel Information */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">
							{t("travelInformation")}
						</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<p className="text-sm text-muted-foreground">{t("email")}</p>
								<p className="font-medium">{request.customerEmail}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">{t("language")}</p>
								<p className="font-medium">{request.language}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">{t("phone")}</p>
								<p className="font-medium">{request.phone}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">{t("adults")}</p>
								<p className="font-medium">{request.numberOfAdults}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">{t("created")}</p>
								<p className="font-medium">
									{format(new Date(request.createdAt), "PPP")}
								</p>
							</div>
						</div>
					</div>

					{/* Pickup Details (only when confirmed) */}
					{request.isConfirmed && request.pickupDate && (
						<div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
							<h3 className="mb-3 text-lg font-semibold">
								{t("pickupDetails")}
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">
										{t("pickupDate")}
									</p>
									<p className="font-medium">
										{format(new Date(request.pickupDate), "PPP")}
									</p>
								</div>
								{request.pickupTime && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("pickupTime")}
										</p>
										<p className="font-medium">{request.pickupTime}</p>
									</div>
								)}
								{request.flightNumber && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("flightNumber")}
										</p>
										<p className="font-medium">{request.flightNumber}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Children Information */}
					{request.areThereChildren && (
						<div>
							<h3 className="mb-3 text-lg font-semibold">
								{t("childrenInformation")}
							</h3>
							<div className="grid grid-cols-2 gap-4">
								{request.numberOfChildren !== null && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("numberOfChildren")}
										</p>
										<p className="font-medium">{request.numberOfChildren}</p>
									</div>
								)}
								{request.ageOfChildren && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("agesOfChildren")}
										</p>
										<p className="font-medium">{request.ageOfChildren}</p>
									</div>
								)}
								{request.numberOfChildSeats !== null && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("childSeatsNeeded")}
										</p>
										<p className="font-medium">{request.numberOfChildSeats}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Additional Information */}
					{request.additionalInfo && (
						<div>
							<h3 className="mb-3 text-lg font-semibold">
								{t("additionalInformation")}
							</h3>
							<p className="whitespace-pre-wrap rounded-lg bg-muted p-3">
								{request.additionalInfo}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Quotations */}
			{request.quotations.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-xl font-bold">{t("quotations")}</h2>
					{request.quotations.map((quotation) => (
						<Card key={quotation.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div>
										<CardTitle className="text-2xl">
											{quotation.currency} {quotation.price.toString()}
										</CardTitle>
										{quotation.isPriceEachWay && (
											<p className="text-sm text-muted-foreground">
												{t("priceEachWay")}
											</p>
										)}
									</div>
									<Badge className={quotationStatusColors[quotation.status]}>
										{quotation.status}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
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
								{quotation.sentAt && (
									<p className="text-sm text-muted-foreground">
										{t("sentDate", {
											date: format(new Date(quotation.sentAt), "PPP"),
										})}
									</p>
								)}
								{quotation.status === "SENT" && (
									<div className="flex gap-2">
										<Button
											onClick={() =>
												acceptQuotation.mutate({ id: quotation.id, token })
											}
											disabled={acceptQuotation.isPending}
										>
											{t("acceptQuotation")}
										</Button>
										<Button
											variant="destructive"
											onClick={() =>
												rejectQuotation.mutate({ id: quotation.id, token })
											}
											disabled={rejectQuotation.isPending}
										>
											{t("reject")}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Message Thread */}
			<Card>
				<CardContent className="pt-6">
					<TripMessageThread mode="customer" token={token} />
				</CardContent>
			</Card>
		</div>
	);
}
