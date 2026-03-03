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
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TripRequestStatus } from "../../../../generated/prisma";

type Route = { pickup: string; destination: string };

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-500",
	QUOTED: "bg-blue-500",
	ACCEPTED: "bg-green-500",
	REJECTED: "bg-red-500",
	COMPLETED: "bg-gray-500",
	CANCELLED: "bg-gray-400",
};

export function AllTripRequests() {
	const t = useTranslations("adminRequests");
	const [statusFilter, setStatusFilter] = useState<TripRequestStatus | "ALL">(
		"ALL",
	);

	const { data, isLoading } = api.tripRequest.getAllRequests.useQuery({
		status: statusFilter === "ALL" ? undefined : statusFilter,
	});

	if (isLoading) return <div>{t("loading")}</div>;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Select
					value={statusFilter}
					onValueChange={(v) => setStatusFilter(v as TripRequestStatus | "ALL")}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder={t("filterByStatus")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">{t("allRequests")}</SelectItem>
						<SelectItem value="PENDING">{t("statusPending")}</SelectItem>
						<SelectItem value="QUOTED">{t("statusQuoted")}</SelectItem>
						<SelectItem value="ACCEPTED">{t("statusAccepted")}</SelectItem>
						<SelectItem value="REJECTED">{t("statusRejected")}</SelectItem>
						<SelectItem value="COMPLETED">{t("statusCompleted")}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{!data?.items.length ? (
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						{t("noRequests")}
					</CardContent>
				</Card>
			) : (
				data.items.map((request) => (
					<Card key={request.id}>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										{request.firstName} {request.lastName}
										<span className="text-sm font-normal text-muted-foreground">
											#{String(request.orderNumber).padStart(7, "0")}
										</span>
									</CardTitle>
									<p className="text-sm text-muted-foreground">
										{request.user.name ?? request.user.email}
									</p>
									<p className="text-xs text-muted-foreground">
										{(() => {
											const routes = JSON.parse(request.routes) as Route[];
											const first = routes[0]!;
											return `${first.pickup} → ${first.destination}${routes.length > 1 ? ` +${routes.length - 1} more` : ""}`;
										})()} ·{" "}
										{request.pickupDate
											? format(new Date(request.pickupDate), "MMM dd, yyyy")
											: format(new Date(request.createdAt), "MMM dd, yyyy")}
									</p>
								</div>
								<Badge className={statusColors[request.status]}>
									{request.status}
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
									<p className="text-muted-foreground">
										{t("quotationsCount", {
											count: request.quotations.length,
										})}
									</p>
								</div>
								<Button asChild>
									<Link href={`/admin/requests/${request.id}`}>
										{t("manage")}
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				))
			)}
		</div>
	);
}
