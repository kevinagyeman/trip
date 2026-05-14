"use client";

import { api } from "@/trpc/react";
import { LANGUAGE_LABELS } from "@/lib/quick-fill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import {
	buildStatusLabels,
	STATUS_COLORS,
	QUOTATION_STATUS_COLORS,
} from "@/lib/trip-utils";

export function TripRequestDetail({ requestId }: { requestId: string }) {
	const router = useRouter();
	const t = useTranslations("requestDetail");
	const tc = useTranslations("common");
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const utils = api.useUtils();
	const {
		data: request,
		isLoading,
		isError,
	} = api.tripRequest.getById.useQuery({
		id: requestId,
	});

	const acceptQuotation = api.quotation.accept.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getById.invalidate({ id: requestId });
			await utils.tripRequest.getMyRequests.invalidate();
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
						</div>
						<div className="flex gap-2">
							<Badge className={STATUS_COLORS[request.status]}>
								{statusLabels[request.status] ?? request.status}
							</Badge>
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
										{tc("routeN", { n: i + 1 })}
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
					<div className="space-y-1 rounded-lg border p-3 text-sm">
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{t("contactDetails")}
						</p>
						<div className="flex flex-wrap gap-x-6 gap-y-1">
							<span>
								<span className="text-muted-foreground">{t("phone")}: </span>
								<span className="font-medium">{request.phone}</span>
							</span>
						</div>
					</div>

					{/* Passengers */}
					<div className="space-y-1 rounded-lg border p-3 text-sm">
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{t("passengers")}
						</p>
						<div className="flex flex-wrap gap-x-6 gap-y-1">
							<span>
								<span className="text-muted-foreground">{t("adults")}: </span>
								<span className="font-medium">{request.numberOfAdults}</span>
							</span>
							{request.areThereChildren &&
								request.numberOfChildren !== null && (
									<span>
										<span className="text-muted-foreground">
											{t("numberOfChildren")}:{" "}
										</span>
										<span className="font-medium">
											{request.numberOfChildren}
										</span>
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

					{/* Preferences */}
					<div className="space-y-1 rounded-lg border p-3 text-sm">
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
									{format(new Date(request.createdAt), "d MMM yyyy")}
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
									<Badge className={QUOTATION_STATUS_COLORS[quotation.status]}>
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
											date: format(
												new Date(quotation.notifiedAt),
												"d MMM yyyy",
											),
										})}
									</p>
								)}
								{quotation.status === "PENDING" && (
									<div className="flex gap-2">
										<Button
											onClick={() =>
												acceptQuotation.mutate({ id: quotation.id })
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
		</div>
	);
}
