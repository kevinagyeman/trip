"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
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
	PENDING: "bg-blue-500",
	ACCEPTED: "bg-green-500",
};

export function PublicTripRequestDetail({ token }: { token: string }) {
	const t = useTranslations("requestDetail");
	const statusLabels: Record<string, string> = {
		PENDING: t("statusPending"),
		QUOTED: t("statusQuoted"),
		ACCEPTED: t("statusAccepted"),
		REJECTED: t("statusRejected"),
		COMPLETED: t("statusCompleted"),
		CANCELLED: t("statusCancelled"),
	};
	const utils = api.useUtils();

	const { data: request, isLoading } = api.tripRequest.getByToken.useQuery({
		token,
	});

	const [pickupDate, setPickupDate] = useState("");
	const [pickupTime, setPickupTime] = useState("");
	const [flightNumber, setFlightNumber] = useState("");
	const [routeDepartures, setRouteDepartures] = useState<
		Array<{
			departureDate: string;
			departureTime: string;
			flightNumber: string;
		}>
	>([]);

	useEffect(() => {
		if (request) {
			const parsed = JSON.parse(request.routes) as Route[];
			setRouteDepartures(
				parsed.map((r) => ({
					departureDate: r.departureDate ?? "",
					departureTime: r.departureTime ?? "",
					flightNumber: r.flightNumber ?? "",
				})),
			);
		}
	}, [request?.id]);

	const acceptQuotation = api.quotation.acceptByToken.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByToken.invalidate({ token });
		},
	});

	const updatePickupDetails = api.tripRequest.updatePickupDetails.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByToken.invalidate({ token });
		},
	});

	const updateRoutes = api.tripRequest.updateRoutes.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByToken.invalidate({ token });
		},
	});

	if (isLoading) return <div>{t("loading")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const routes: Route[] = JSON.parse(request.routes) as Route[];
	const showPickupForm = request.status === "ACCEPTED" && !request.isConfirmed;

	return (
		<div className="space-y-6">
			{/* Persistent email notification notice */}
			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-950/30">
				<p className="text-blue-800 dark:text-blue-300">
					{t("emailNotice", { email: request.fromEmail })}
				</p>
			</div>

			{/* Main Request Information */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground">
								#{String(request.orderNumber).padStart(7, "0")}
							</p>
							<CardTitle className="text-2xl">
								{request.firstName} {request.lastName}
							</CardTitle>
							<div className="space-y-0.5">
								{routes.map((route, i) => (
									<p key={i} className="text-sm text-muted-foreground">
										{route.pickup} → {route.destination}
									</p>
								))}
							</div>
						</div>
						<div className="flex gap-2">
							<Badge className={statusColors[request.status]}>
								{statusLabels[request.status] ?? request.status}
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
						<div className="space-y-2">
							{routes.map((route, i) => (
								<div key={i} className="rounded-lg border p-3 text-sm">
									<p className="mb-1 text-xs font-medium text-muted-foreground">
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
									{(route.departureDate ??
										route.departureTime ??
										route.flightNumber) && (
										<div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
											{route.departureDate && (
												<span>
													{t("routeDepartureDate")}:{" "}
													<span className="font-medium text-foreground">
														{route.departureDate}
													</span>
												</span>
											)}
											{route.departureTime && (
												<span>
													{t("routeDepartureTime")}:{" "}
													<span className="font-medium text-foreground">
														{route.departureTime}
													</span>
												</span>
											)}
											{route.flightNumber && (
												<span>
													{t("routeFlightNumber")}:{" "}
													<span className="font-medium text-foreground">
														{route.flightNumber}
													</span>
												</span>
											)}
										</div>
									)}
									{!["COMPLETED", "CANCELLED"].includes(request.status) && (
										<div className="mt-3 grid grid-cols-1 gap-2 border-t pt-3 sm:grid-cols-3">
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
										</div>
									)}
								</div>
							))}
							{!["COMPLETED", "CANCELLED"].includes(request.status) && (
								<Button
									className="mt-2"
									size="sm"
									variant="outline"
									disabled={updateRoutes.isPending}
									onClick={() =>
										updateRoutes.mutate({
											token,
											routes: routes.map((r, i) => ({
												...r,
												departureDate:
													routeDepartures[i]?.departureDate || undefined,
												departureTime:
													routeDepartures[i]?.departureTime || undefined,
												flightNumber:
													routeDepartures[i]?.flightNumber || undefined,
											})),
										})
									}
								>
									{updateRoutes.isPending ? t("saving") : t("saveRouteDetails")}
								</Button>
							)}
						</div>
					</div>

					{/* Contact Details */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">
							{t("contactDetails")}
						</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<p className="text-sm text-muted-foreground">{t("email")}</p>
								<p className="font-medium">{request.customerEmail}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">{t("phone")}</p>
								<p className="font-medium">{request.phone}</p>
							</div>
						</div>
					</div>

					{/* Passengers */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">{t("passengers")}</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">{t("adults")}</p>
								<p className="font-medium">{request.numberOfAdults}</p>
							</div>
							{request.areThereChildren &&
								request.numberOfChildren !== null && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("numberOfChildren")}
										</p>
										<p className="font-medium">{request.numberOfChildren}</p>
									</div>
								)}
							{request.areThereChildren && request.ageOfChildren && (
								<div>
									<p className="text-sm text-muted-foreground">
										{t("agesOfChildren")}
									</p>
									<p className="font-medium">{request.ageOfChildren}</p>
								</div>
							)}
							{request.areThereChildren &&
								request.numberOfChildSeats !== null && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("childSeatsNeeded")}
										</p>
										<p className="font-medium">{request.numberOfChildSeats}</p>
									</div>
								)}
						</div>
					</div>

					{/* Preferences */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">{t("preferences")}</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">{t("language")}</p>
								<p className="font-medium">{request.language}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">{t("created")}</p>
								<p className="font-medium">
									{format(new Date(request.createdAt), "PPP")}
								</p>
							</div>
						</div>
						{request.additionalInfo && (
							<p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">
								{request.additionalInfo}
							</p>
						)}
					</div>

					{/* Pickup Details — form (editable) or read-only */}
					{showPickupForm ? (
						<div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
							<h3 className="mb-1 text-lg font-semibold">
								{t("pickupDetails")}
							</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								{t("pickupDetailsDesc")}
							</p>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								<div className="space-y-1">
									<Label className="text-xs">{t("pickupDate")} *</Label>
									<Input
										type="date"
										value={pickupDate}
										onChange={(e) => setPickupDate(e.target.value)}
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-xs">{t("pickupTime")} *</Label>
									<Input
										type="time"
										value={pickupTime}
										onChange={(e) => setPickupTime(e.target.value)}
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-xs">{t("flightNumber")}</Label>
									<Input
										placeholder={t("routeFlightNumberPlaceholder")}
										value={flightNumber}
										onChange={(e) => setFlightNumber(e.target.value)}
									/>
								</div>
							</div>
							<Button
								className="mt-4"
								size="sm"
								disabled={
									!pickupDate || !pickupTime || updatePickupDetails.isPending
								}
								onClick={() =>
									updatePickupDetails.mutate({
										token,
										pickupDate,
										pickupTime,
										flightNumber: flightNumber || undefined,
									})
								}
							>
								{updatePickupDetails.isPending
									? t("saving")
									: t("savePickupDetails")}
							</Button>
						</div>
					) : request.isConfirmed && request.pickupDate ? (
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
					) : null}
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
								{quotation.notifiedAt && (
									<p className="text-sm text-muted-foreground">
										{t("notifiedDate", {
											date: format(new Date(quotation.notifiedAt), "PPP"),
										})}
									</p>
								)}
								{quotation.status === "PENDING" && (
									<div className="flex gap-2">
										<Button
											onClick={() =>
												acceptQuotation.mutate({ id: quotation.id, token })
											}
											disabled={acceptQuotation.isPending}
										>
											{t("acceptQuotation")}
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
