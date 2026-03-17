"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { parseRoutes, STATUS_COLORS } from "@/lib/trip-utils";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRef, useState } from "react";
import type { TripRequestStatus } from "../../../../generated/prisma";

export function AllTripRequests() {
	const t = useTranslations("adminRequests");
	const statusLabels: Record<string, string> = {
		PENDING: t("statusPending"),
		QUOTED: t("statusQuoted"),
		ACCEPTED: t("statusAccepted"),
		REJECTED: t("statusRejected"),
		COMPLETED: t("statusCompleted"),
		CANCELLED: t("statusCancelled"),
	};
	const [statusFilter, setStatusFilter] = useState<TripRequestStatus | "ALL">(
		"ALL",
	);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const debounceRef = useRef<ReturnType<typeof setTimeout>>();

	// Debounce search input
	const handleSearch = (value: string) => {
		setSearch(value);
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400);
	};

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		api.tripRequest.getAllRequests.useInfiniteQuery(
			{
				status: statusFilter === "ALL" ? undefined : statusFilter,
				search: debouncedSearch || undefined,
				limit: 20,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const items = data?.pages.flatMap((p) => p.items) ?? [];

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="grid grid-cols-2 gap-3 sm:flex-row sm:items-center">
				<div className="relative min-w-0 flex-1">
					<Input
						className="w-full pl-9"
						placeholder={t("searchPlaceholder")}
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>
				<Select
					value={statusFilter}
					onValueChange={(v) => setStatusFilter(v as TripRequestStatus | "ALL")}
				>
					<SelectTrigger className="w-full sm:w-[200px]">
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

			{isLoading ? (
				<div>{t("loading")}</div>
			) : !items.length ? (
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						{t("noRequests")}
					</CardContent>
				</Card>
			) : (
				<>
					{items.map((request) => (
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
										<p className="text-sm text-muted-foreground">
											{request.user?.name ??
												request.user?.email ??
												request.customerEmail}
										</p>
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
					))}

					{hasNextPage && (
						<div className="flex justify-center pt-2">
							<Button
								variant="outline"
								onClick={() => void fetchNextPage()}
								disabled={isFetchingNextPage}
							>
								{isFetchingNextPage ? t("loading") : t("loadMore")}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
