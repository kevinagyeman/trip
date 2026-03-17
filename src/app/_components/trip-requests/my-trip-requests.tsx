"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseRoutes, STATUS_COLORS } from "@/lib/trip-utils";
import Link from "next/link";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

export function MyTripRequests() {
	const t = useTranslations("myRequests");
	const statusLabels: Record<string, string> = {
		PENDING: t("statusPending"),
		QUOTED: t("statusQuoted"),
		ACCEPTED: t("statusAccepted"),
		REJECTED: t("statusRejected"),
		COMPLETED: t("statusCompleted"),
		CANCELLED: t("statusCancelled"),
	};
	const { data, isLoading } = api.tripRequest.getMyRequests.useQuery();

	if (isLoading) {
		return <div>{t("loading")}</div>;
	}

	if (!data?.items.length) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					{t("noRequests")}
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{data.items.map((request) => (
				<Card key={request.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="space-y-0.5">
								<p className="text-xs font-medium text-muted-foreground">
									#{String(request.orderNumber).padStart(7, "0")}
								</p>
								<CardTitle>
									{request.firstName} {request.lastName}
								</CardTitle>
								{parseRoutes(request.routes).map((route, i) => (
									<p key={i} className="text-xs text-muted-foreground">
										{route.pickup} → {route.destination}
										{(route.departureTime ?? route.departureDate) && (
											<span className="ml-2">
												{route.departureTime}
												{route.departureDate &&
													` · ${format(new Date(route.departureDate), "dd/MM")}`}
											</span>
										)}
									</p>
								))}
							</div>
							<Badge className={STATUS_COLORS[request.status]}>
								{statusLabels[request.status] ?? request.status}
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="text-sm">
								<p>
									{t("adultsCount", { count: request.numberOfAdults })}
									{request.numberOfChildren
										? `, ${t("childrenCount", { count: request.numberOfChildren })}`
										: ""}
								</p>
								{request.quotations.length > 0 && (
									<p className="mt-1 font-medium text-green-600">
										{t("quotationsReceived", {
											count: request.quotations.length,
										})}
									</p>
								)}
							</div>
							<Button asChild variant="outline">
								<Link href={`/dashboard/requests/${request.id}`}>
									{t("viewDetails")}
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
