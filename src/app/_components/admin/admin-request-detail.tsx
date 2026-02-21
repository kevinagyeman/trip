"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SERVICE_TYPES, AIRPORTS } from "@/lib/airports";
import type { TripRequestStatus } from "../../../../generated/prisma";

export function AdminRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
	const utils = api.useUtils();

	const { data: request, isLoading } = api.tripRequest.getByIdAdmin.useQuery({
		id: requestId,
	});

	const updateStatus = api.tripRequest.updateStatus.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
			await utils.tripRequest.getAllRequests.invalidate();
		},
	});

	const sendQuotation = api.quotation.send.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
		},
	});

	const deleteQuotation = api.quotation.delete.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: requestId });
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

	return (
		<div className="space-y-6">
			<Button variant="outline" onClick={() => router.back()}>
				Back to Dashboard
			</Button>

			{/* Customer Information */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-2xl">
								{request.firstName} {request.lastName}
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								{request.user.email}
							</p>
							<p className="text-sm text-muted-foreground">
								Service: {serviceTypeLabel}
							</p>
						</div>
						<div className="flex flex-col items-end gap-2">
							<Select
								value={request.status}
								onValueChange={(value) =>
									updateStatus.mutate({
										id: requestId,
										status: value as TripRequestStatus,
									})
								}
							>
								<SelectTrigger className="w-[150px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="PENDING">Pending</SelectItem>
									<SelectItem value="QUOTED">Quoted</SelectItem>
									<SelectItem value="ACCEPTED">Accepted</SelectItem>
									<SelectItem value="REJECTED">Rejected</SelectItem>
									<SelectItem value="COMPLETED">Completed</SelectItem>
									<SelectItem value="CANCELLED">Cancelled</SelectItem>
								</SelectContent>
							</Select>
							{request.isConfirmed && (
								<Badge variant="outline">Confirmed</Badge>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Contact & Travel Info */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">
							Contact & Travel Information
						</h3>
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
						<div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
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
						<div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
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
						<div className="rounded-lg border p-4">
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

			{/* Quotations Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold">Quotations</h2>
					<Link href={`/admin/requests/${requestId}/quotations/new`}>
						<Button>Create Quotation</Button>
					</Link>
				</div>

				{request.quotations.length === 0 ? (
					<Card>
						<CardContent className="py-8 text-center text-muted-foreground">
							No quotations yet.
						</CardContent>
					</Card>
				) : (
					request.quotations.map((quotation) => (
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
											Additional Information (Customer Visible)
										</p>
										<p className="mt-1 whitespace-pre-wrap text-sm">
											{quotation.quotationAdditionalInfo}
										</p>
									</div>
								)}
								{quotation.internalNotes && (
									<div className="rounded-lg bg-yellow-50 p-3">
										<p className="text-sm font-medium text-muted-foreground">
											Internal Notes (Admin Only)
										</p>
										<p className="mt-1 text-sm">{quotation.internalNotes}</p>
									</div>
								)}
								<div className="flex flex-wrap gap-2">
									{quotation.status === "DRAFT" && (
										<>
											<Button
												onClick={() =>
													sendQuotation.mutate({ id: quotation.id })
												}
												disabled={sendQuotation.isPending}
											>
												Send to Customer
											</Button>
											<Button
												variant="destructive"
												onClick={() =>
													deleteQuotation.mutate({ id: quotation.id })
												}
												disabled={deleteQuotation.isPending}
											>
												Delete Draft
											</Button>
										</>
									)}
									{quotation.sentAt && (
										<p className="text-sm text-muted-foreground">
											Sent: {format(new Date(quotation.sentAt), "PPP")}
										</p>
									)}
									{quotation.respondedAt && (
										<p className="text-sm text-muted-foreground">
											Responded:{" "}
											{format(new Date(quotation.respondedAt), "PPP")}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
