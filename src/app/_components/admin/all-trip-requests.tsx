"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	buildStatusLabels,
	parseRoutes,
	STATUS_COLORS,
} from "@/lib/trip-utils";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRef, useState } from "react";
import type { TripRequestStatus } from "../../../../generated/prisma";

export function AllTripRequests() {
	const t = useTranslations("adminRequests");
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const [statusFilter, setStatusFilter] = useState<TripRequestStatus | "ALL">(
		"ALL",
	);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
		<div className="space-y-4 pb-8">
			{/* Filters */}
			<div className="grid grid-cols-2 gap-3 sm:flex-row sm:items-center">
				<div className="relative min-w-0 flex-1">
					<Input
						className="w-full"
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
						<SelectItem value="CONFIRMED">{t("statusConfirmed")}</SelectItem>
						<SelectItem value="REJECTED">{t("statusRejected")}</SelectItem>
						<SelectItem value="COMPLETED">{t("statusCompleted")}</SelectItem>
						<SelectItem value="CANCELLED">{t("statusCancelled")}</SelectItem>
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
							<CardContent className="px-3">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 space-y-0.5">
										<div className="flex items-center gap-2">
											<p className="text-xs text-muted-foreground">
												#{String(request.orderNumber).padStart(7, "0")}
												<span className="ml-2">
													{format(new Date(request.createdAt), "d MMM yyyy")}
												</span>
											</p>
											<Badge
												className={`px-1.5 py-0 text-xs font-medium ${STATUS_COLORS[request.status]}`}
											>
												{statusLabels[request.status] ?? request.status}
											</Badge>
										</div>
										<p className="truncate text-sm font-semibold mt-3">
											{request.firstName} {request.lastName}
											<span className="ml-1.5 font-normal text-muted-foreground">
												{request.user?.email ?? request.customerEmail}
											</span>
										</p>
										<div className="mt-1.5 space-y-0.5">
											{parseRoutes(request.routes).map((route, i) => (
												<p
													key={i}
													className="truncate text-xs text-muted-foreground"
												>
													{route.pickup} → {route.destination}
													{(route.departureTime ?? route.departureDate) && (
														<span className="ml-1.5">
															{route.departureTime}
															{route.departureDate &&
																` · ${format(new Date(route.departureDate), "d MMM")}`}
														</span>
													)}
												</p>
											))}
										</div>
									</div>
									<Button
										asChild
										variant="ghost"
										size="icon-sm"
										className="shrink-0 self-center"
									>
										<Link href={`/admin/requests/${request.id}`}>
											<ArrowRight className="h-4 w-4" />
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
