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
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AIRPORTS } from "@/lib/airports";
import { CalendarPlus } from "lucide-react";
import type { TripRequestStatus } from "../../../../generated/prisma";

function toICSDateTime(date: Date, timeStr?: string | null): string {
	const d = new Date(date);
	if (timeStr) {
		const [h, m] = timeStr.split(":").map(Number);
		d.setHours(h ?? 0, m ?? 0, 0, 0);
	}
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function buildICS(params: {
	uid: string;
	summary: string;
	description: string;
	location: string;
	start: string;
	end: string;
}): string {
	return [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Trip Manager//EN",
		"BEGIN:VEVENT",
		`UID:${params.uid}`,
		`DTSTAMP:${toICSDateTime(new Date())}`,
		`DTSTART:${params.start}`,
		`DTEND:${params.end}`,
		`SUMMARY:${params.summary}`,
		`DESCRIPTION:${params.description}`,
		`LOCATION:${params.location}`,
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");
}

function downloadICS(filename: string, content: string) {
	const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function googleCalendarUrl(params: {
	summary: string;
	description: string;
	location: string;
	start: string;
	end: string;
}): string {
	const p = new URLSearchParams({
		action: "TEMPLATE",
		text: params.summary,
		details: params.description,
		location: params.location,
		dates: `${params.start}/${params.end}`,
	});
	return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

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

export function AdminRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
	const t = useTranslations("adminDetail");
	const tSvc = useTranslations("serviceTypes");
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

	if (isLoading) return <div>{t("loading")}</div>;
	if (!request) return <div>{t("notFound")}</div>;

	const serviceTypeLabel = tSvc(
		request.serviceType as "both" | "arrival" | "departure",
	);
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
				{t("backToDashboard")}
			</Button>

			{/* Customer Information */}
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
								{request.user.email}
							</p>
							<p className="text-sm text-muted-foreground">
								{t("service", { type: serviceTypeLabel })}
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
									<SelectItem value="PENDING">{t("statusPending")}</SelectItem>
									<SelectItem value="QUOTED">{t("statusQuoted")}</SelectItem>
									<SelectItem value="ACCEPTED">
										{t("statusAccepted")}
									</SelectItem>
									<SelectItem value="REJECTED">
										{t("statusRejected")}
									</SelectItem>
									<SelectItem value="COMPLETED">
										{t("statusCompleted")}
									</SelectItem>
									<SelectItem value="CANCELLED">
										{t("statusCancelled")}
									</SelectItem>
								</SelectContent>
							</Select>
							{request.isConfirmed && (
								<Badge variant="outline">{t("confirmed")}</Badge>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Contact & Travel Info */}
					<div>
						<h3 className="mb-3 text-lg font-semibold">
							{t("contactTravelInfo")}
						</h3>
						<div className="grid grid-cols-2 gap-4">
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

					{/* Arrival Information */}
					{showArrivalFields && (
						<div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
							<h3 className="mb-3 text-lg font-semibold">
								{t("arrivalInformation")}
							</h3>
							<div className="grid gap-3">
								{request.arrivalAirport && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("airport")}
										</p>
										<p className="font-medium">
											{getAirportLabel(request.arrivalAirport)}
										</p>
									</div>
								)}
								{request.destinationAddress && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("destinationAddress")}
										</p>
										<p className="font-medium">{request.destinationAddress}</p>
									</div>
								)}
								{request.arrivalFlightDate && (
									<div className="grid grid-cols-3 gap-3">
										<div>
											<p className="text-sm text-muted-foreground">
												{t("flightDate")}
											</p>
											<p className="font-medium">
												{format(new Date(request.arrivalFlightDate), "PPP")}
											</p>
										</div>
										{request.arrivalFlightTime && (
											<div>
												<p className="text-sm text-muted-foreground">
													{t("flightTime")}
												</p>
												<p className="font-medium">
													{request.arrivalFlightTime}
												</p>
											</div>
										)}
										{request.arrivalFlightNumber && (
											<div>
												<p className="text-sm text-muted-foreground">
													{t("flightNumber")}
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
						<div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
							<h3 className="mb-3 text-lg font-semibold">
								{t("departureInformation")}
							</h3>
							<div className="grid gap-3">
								{request.pickupAddress && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("pickupAddress")}
										</p>
										<p className="font-medium">{request.pickupAddress}</p>
									</div>
								)}
								{request.departureAirport && (
									<div>
										<p className="text-sm text-muted-foreground">
											{t("airport")}
										</p>
										<p className="font-medium">
											{getAirportLabel(request.departureAirport)}
										</p>
									</div>
								)}
								{request.departureFlightDate && (
									<div className="grid grid-cols-3 gap-3">
										<div>
											<p className="text-sm text-muted-foreground">
												{t("flightDate")}
											</p>
											<p className="font-medium">
												{format(new Date(request.departureFlightDate), "PPP")}
											</p>
										</div>
										{request.departureFlightTime && (
											<div>
												<p className="text-sm text-muted-foreground">
													{t("flightTime")}
												</p>
												<p className="font-medium">
													{request.departureFlightTime}
												</p>
											</div>
										)}
										{request.departureFlightNumber && (
											<div>
												<p className="text-sm text-muted-foreground">
													{t("flightNumber")}
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

			{/* Calendar Section — only when trip is confirmed */}
			{request.isConfirmed && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<CalendarPlus className="h-5 w-5" />
							{t("addToCalendar")}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-3">
						{showArrivalFields && request.arrivalFlightDate && (
							<div className="flex flex-col gap-2">
								<p className="text-sm font-medium">{t("arrivalPickup")}</p>
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											const start = toICSDateTime(
												new Date(request.arrivalFlightDate!),
												request.arrivalFlightTime,
											);
											const endDate = new Date(request.arrivalFlightDate!);
											if (request.arrivalFlightTime) {
												const [h, m] = request.arrivalFlightTime.split(":").map(Number);
												endDate.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
											} else {
												endDate.setHours(endDate.getHours() + 1);
											}
											const end = toICSDateTime(endDate);
											const summary = `${t("arrivalPickup")} — ${request.firstName} ${request.lastName}`;
											const description = [
												`${t("calFlightNumber")}: ${request.arrivalFlightNumber ?? "—"}`,
												`${t("calAirport")}: ${getAirportLabel(request.arrivalAirport)}`,
												`${t("calDestination")}: ${request.destinationAddress ?? "—"}`,
												`${t("calPassengers")}: ${request.numberOfAdults}`,
											].join("\\n");
											downloadICS(
												`arrival-${request.id}.ics`,
												buildICS({
													uid: `arrival-${request.id}@tripmanager`,
													summary,
													description,
													location: getAirportLabel(request.arrivalAirport),
													start,
													end,
												}),
											);
										}}
									>
										{t("downloadICS")}
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											const start = toICSDateTime(
												new Date(request.arrivalFlightDate!),
												request.arrivalFlightTime,
											);
											const endDate = new Date(request.arrivalFlightDate!);
											if (request.arrivalFlightTime) {
												const [h, m] = request.arrivalFlightTime.split(":").map(Number);
												endDate.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
											} else {
												endDate.setHours(endDate.getHours() + 1);
											}
											const end = toICSDateTime(endDate);
											window.open(
												googleCalendarUrl({
													summary: `${t("arrivalPickup")} — ${request.firstName} ${request.lastName}`,
													description: `${t("calFlightNumber")}: ${request.arrivalFlightNumber ?? "—"}\n${t("calDestination")}: ${request.destinationAddress ?? "—"}`,
													location: getAirportLabel(request.arrivalAirport),
													start,
													end,
												}),
												"_blank",
											);
										}}
									>
										{t("googleCalendar")}
									</Button>
								</div>
							</div>
						)}

						{showDepartureFields && request.departureFlightDate && (
							<div className="flex flex-col gap-2">
								<p className="text-sm font-medium">{t("departurePickup")}</p>
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											const start = toICSDateTime(
												new Date(request.departureFlightDate!),
												request.departureFlightTime,
											);
											const endDate = new Date(request.departureFlightDate!);
											if (request.departureFlightTime) {
												const [h, m] = request.departureFlightTime.split(":").map(Number);
												endDate.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
											} else {
												endDate.setHours(endDate.getHours() + 1);
											}
											const end = toICSDateTime(endDate);
											const summary = `${t("departurePickup")} — ${request.firstName} ${request.lastName}`;
											const description = [
												`${t("calFlightNumber")}: ${request.departureFlightNumber ?? "—"}`,
												`${t("calPickup")}: ${request.pickupAddress ?? "—"}`,
												`${t("calAirport")}: ${getAirportLabel(request.departureAirport)}`,
												`${t("calPassengers")}: ${request.numberOfAdults}`,
											].join("\\n");
											downloadICS(
												`departure-${request.id}.ics`,
												buildICS({
													uid: `departure-${request.id}@tripmanager`,
													summary,
													description,
													location: request.pickupAddress ?? "",
													start,
													end,
												}),
											);
										}}
									>
										{t("downloadICS")}
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											const start = toICSDateTime(
												new Date(request.departureFlightDate!),
												request.departureFlightTime,
											);
											const endDate = new Date(request.departureFlightDate!);
											if (request.departureFlightTime) {
												const [h, m] = request.departureFlightTime.split(":").map(Number);
												endDate.setHours((h ?? 0) + 1, m ?? 0, 0, 0);
											} else {
												endDate.setHours(endDate.getHours() + 1);
											}
											const end = toICSDateTime(endDate);
											window.open(
												googleCalendarUrl({
													summary: `${t("departurePickup")} — ${request.firstName} ${request.lastName}`,
													description: `${t("calFlightNumber")}: ${request.departureFlightNumber ?? "—"}\n${t("calPickup")}: ${request.pickupAddress ?? "—"}`,
													location: request.pickupAddress ?? "",
													start,
													end,
												}),
												"_blank",
											);
										}}
									>
										{t("googleCalendar")}
									</Button>
								</div>
							</div>
						)}

						{!request.arrivalFlightDate && !request.departureFlightDate && (
							<p className="text-sm text-muted-foreground">{t("noFlightDates")}</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Quotations Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold">{t("quotations")}</h2>
					<Link href={`/admin/requests/${requestId}/quotations/new`}>
						<Button>{t("createQuotation")}</Button>
					</Link>
				</div>

				{request.quotations.length === 0 ? (
					<Card>
						<CardContent className="py-8 text-center text-muted-foreground">
							{t("noQuotations")}
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
											{t("additionalInfoCustomer")}
										</p>
										<p className="mt-1 whitespace-pre-wrap text-sm">
											{quotation.quotationAdditionalInfo}
										</p>
									</div>
								)}
								{quotation.internalNotes && (
									<div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/30">
										<p className="text-sm font-medium text-muted-foreground">
											{t("internalNotes")}
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
												{t("sendToCustomer")}
											</Button>
											<Button
												variant="destructive"
												onClick={() =>
													deleteQuotation.mutate({ id: quotation.id })
												}
												disabled={deleteQuotation.isPending}
											>
												{t("deleteDraft")}
											</Button>
										</>
									)}
									{quotation.sentAt && (
										<p className="text-sm text-muted-foreground">
											{t("sentDate", {
												date: format(new Date(quotation.sentAt), "PPP"),
											})}
										</p>
									)}
									{quotation.respondedAt && (
										<p className="text-sm text-muted-foreground">
											{t("respondedDate", {
												date: format(new Date(quotation.respondedAt), "PPP"),
											})}
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
