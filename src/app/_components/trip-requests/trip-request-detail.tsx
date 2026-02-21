"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { SERVICE_TYPES, AIRPORTS } from "@/lib/airports";

export function TripRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
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

	if (isLoading) return <div>Loading...</div>;
	if (!request) return <div>Not found</div>;

	const serviceTypeLabel =
		SERVICE_TYPES.find((t) => t.value === request.serviceType)?.label ??
		request.serviceType;
	const showArrivalFields =
		request.serviceType === "both" || request.serviceType === "arrival";
	const showDepartureFields =
		request.serviceType === "both" || request.serviceType === "departure";

	const getAirportLabel = (code: string | null) => {
		if (!code) return "";
		return AIRPORTS.find((a) => a.value === code)?.label ?? code;
	};

	const hasAcceptedQuotation = request.quotations.some(
		(q) => q.status === "ACCEPTED",
	);
	const needsConfirmation = hasAcceptedQuotation && !request.isConfirmed;

	return (
		<div className="space-y-6">
			<Button variant="outline" onClick={() => router.back()}>
				Back
			</Button>

			{/* Main Request Information */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-2xl">
								{request.firstName} {request.lastName}
							</CardTitle>
							<p className="text-muted-foreground">{serviceTypeLabel}</p>
						</div>
						<div className="flex gap-2">
							<Badge>{request.status}</Badge>
							{request.isConfirmed && (
								<Badge variant="outline">Confirmed</Badge>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Travel Information */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">Travel Information</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">Language</p>
								<p className="font-medium">{request.language}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Phone</p>
								<p className="font-medium">{request.phone}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Adults</p>
								<p className="font-medium">{request.numberOfAdults}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Created</p>
								<p className="font-medium">
									{format(new Date(request.createdAt), "PPP")}
								</p>
							</div>
						</div>
					</div>

					{/* Arrival Information */}
					{showArrivalFields && (
						<div className="rounded-lg border p-4">
							<h3 className="mb-3 text-lg font-semibold">
								Arrival Information
							</h3>
							<div className="grid gap-3">
								{request.arrivalAirport && (
									<div>
										<p className="text-sm text-muted-foreground">Airport</p>
										<p className="font-medium">
											{getAirportLabel(request.arrivalAirport)}
										</p>
									</div>
								)}
								{request.destinationAddress && (
									<div>
										<p className="text-sm text-muted-foreground">
											Destination Address
										</p>
										<p className="font-medium">{request.destinationAddress}</p>
									</div>
								)}
								{request.arrivalFlightDate && (
									<div className="grid grid-cols-3 gap-3">
										<div>
											<p className="text-sm text-muted-foreground">
												Flight Date
											</p>
											<p className="font-medium">
												{format(new Date(request.arrivalFlightDate), "PPP")}
											</p>
										</div>
										{request.arrivalFlightTime && (
											<div>
												<p className="text-sm text-muted-foreground">
													Flight Time
												</p>
												<p className="font-medium">
													{request.arrivalFlightTime}
												</p>
											</div>
										)}
										{request.arrivalFlightNumber && (
											<div>
												<p className="text-sm text-muted-foreground">
													Flight Number
												</p>
												<p className="font-medium">
													{request.arrivalFlightNumber}
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					)}

					{/* Departure Information */}
					{showDepartureFields && (
						<div className="rounded-lg border p-4">
							<h3 className="mb-3 text-lg font-semibold">
								Departure Information
							</h3>
							<div className="grid gap-3">
								{request.pickupAddress && (
									<div>
										<p className="text-sm text-muted-foreground">
											Pickup Address
										</p>
										<p className="font-medium">{request.pickupAddress}</p>
									</div>
								)}
								{request.departureAirport && (
									<div>
										<p className="text-sm text-muted-foreground">Airport</p>
										<p className="font-medium">
											{getAirportLabel(request.departureAirport)}
										</p>
									</div>
								)}
								{request.departureFlightDate && (
									<div className="grid grid-cols-3 gap-3">
										<div>
											<p className="text-sm text-muted-foreground">
												Flight Date
											</p>
											<p className="font-medium">
												{format(new Date(request.departureFlightDate), "PPP")}
											</p>
										</div>
										{request.departureFlightTime && (
											<div>
												<p className="text-sm text-muted-foreground">
													Flight Time
												</p>
												<p className="font-medium">
													{request.departureFlightTime}
												</p>
											</div>
										)}
										{request.departureFlightNumber && (
											<div>
												<p className="text-sm text-muted-foreground">
													Flight Number
												</p>
												<p className="font-medium">
													{request.departureFlightNumber}
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					)}

					{/* Children Information */}
					{request.areThereChildren && (
						<div>
							<h3 className="mb-3 text-lg font-semibold">
								Children Information
							</h3>
							<div className="grid grid-cols-2 gap-4">
								{request.numberOfChildren !== null && (
									<div>
										<p className="text-sm text-muted-foreground">
											Number of Children
										</p>
										<p className="font-medium">{request.numberOfChildren}</p>
									</div>
								)}
								{request.ageOfChildren && (
									<div>
										<p className="text-sm text-muted-foreground">
											Ages of Children
										</p>
										<p className="font-medium">{request.ageOfChildren}</p>
									</div>
								)}
								{request.numberOfChildSeats !== null && (
									<div>
										<p className="text-sm text-muted-foreground">
											Child Seats Needed
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
								Additional Information
							</h3>
							<p className="whitespace-pre-wrap rounded-lg bg-muted p-3">
								{request.additionalInfo}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Confirmation Prompt */}
			{needsConfirmation && (
				<Card className="border-yellow-500 bg-yellow-50">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="font-semibold">Trip Confirmation Required</h3>
								<p className="text-sm text-muted-foreground">
									Please confirm your trip by providing complete flight details
								</p>
							</div>
							<Button
								onClick={() =>
									router.push(`/dashboard/requests/${requestId}/confirm`)
								}
							>
								Confirm Trip
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Quotations */}
			{request.quotations.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-xl font-bold">Quotations</h2>
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
												Price for each way
											</p>
										)}
									</div>
									<Badge>{quotation.status}</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{quotation.areCarSeatsIncluded && (
									<div className="rounded-lg bg-muted p-3">
										<p className="text-sm font-medium">
											Car seats are included in the price
										</p>
									</div>
								)}
								{quotation.quotationAdditionalInfo && (
									<div>
										<p className="text-sm text-muted-foreground">
											Additional Information
										</p>
										<p className="mt-1 whitespace-pre-wrap">
											{quotation.quotationAdditionalInfo}
										</p>
									</div>
								)}
								{quotation.sentAt && (
									<p className="text-sm text-muted-foreground">
										Sent: {format(new Date(quotation.sentAt), "PPP")}
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
											Accept Quotation
										</Button>
										<Button
											variant="destructive"
											onClick={() =>
												rejectQuotation.mutate({ id: quotation.id })
											}
											disabled={rejectQuotation.isPending}
										>
											Reject
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
