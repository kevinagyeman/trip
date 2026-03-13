"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Route = {
	pickup: string;
	destination: string;
	departureDate?: string;
	departureTime?: string;
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

export function TripRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
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
	const { data: request, isLoading } = api.tripRequest.getById.useQuery({
		id: requestId,
	});

	const acceptQuotation = api.quotation.accept.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getById.invalidate({ id: requestId });
			await utils.tripRequest.getMyRequests.invalidate();
		},
	});

	const rejectQuotation = api.quotation.reject.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getById.invalidate({ id: requestId });
			await utils.tripRequest.getMyRequests.invalidate();
		},
	});

	if (isLoading) return <div>{t("loading")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const routes: Route[] = JSON.parse(request.routes) as Route[];

	return (
		<div className="space-y-6">
			<Button variant="outline" onClick={() => router.back()}>
				{t("back")}
			</Button>

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
										{(route.departureTime ?? route.departureDate) && (
											<span className="ml-2 text-xs">
												{route.departureTime}
												{route.departureDate &&
													` · ${format(new Date(route.departureDate), "dd/MM")}`}
											</span>
										)}
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
								</div>
							))}
						</div>
					</div>

					{/* Contact Details */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">
							{t("contactDetails")}
						</h3>
						<div className="grid grid-cols-2 gap-4">
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
												acceptQuotation.mutate({ id: quotation.id })
											}
											disabled={acceptQuotation.isPending}
										>
											{t("acceptQuotation")}
										</Button>
										<Button
											variant="destructive"
											onClick={() =>
												rejectQuotation.mutate({ id: quotation.id })
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
		</div>
	);
}
