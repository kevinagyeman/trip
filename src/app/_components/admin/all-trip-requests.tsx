"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import { CopyLinkCard } from "@/app/_components/ui/copy-link-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildStatusLabels, STATUS_COLORS } from "@/lib/trip-utils";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { ArrowRight, Loader2, MoveRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRef, useState } from "react";
import type { TripRequestStatus } from "../../../../generated/prisma";

export function AllTripRequests() {
	const t = useTranslations("adminRequests");
	const statusLabels = buildStatusLabels(t as (key: string) => string);
	const { data: myCompany } = api.company.getMySlug.useQuery();
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
				<CustomInput
					className="min-w-0 flex-1"
					placeholder={t("searchPlaceholder")}
					inputProps={{
						value: search,
						onChange: (e) => handleSearch(e.target.value),
					}}
				/>
				<CustomSelect
					value={statusFilter}
					onValueChange={(v) => setStatusFilter(v as TripRequestStatus | "ALL")}
					placeholder={t("filterByStatus")}
					options={[
						{ value: "ALL", label: t("allRequests") },
						{ value: "PENDING", label: t("statusPending") },
						{ value: "QUOTED", label: t("statusQuoted") },
						{ value: "ACCEPTED", label: t("statusAccepted") },
						{ value: "CONFIRMED", label: t("statusConfirmed") },
						{ value: "REJECTED", label: t("statusRejected") },
						{ value: "COMPLETED", label: t("statusCompleted") },
						{ value: "CANCELLED", label: t("statusCancelled") },
					]}
				/>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			) : !items.length ? (
				myCompany?.slug ? (
					<CopyLinkCard
						url={`/book/${myCompany.slug}`}
						title={t("noRequests")}
						subtitle={t("noRequestsDesc")}
					/>
				) : (
					<Card>
						<CardContent className="py-8 text-center text-muted-foreground">
							{t("noRequests")}
						</CardContent>
					</Card>
				)
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
											{request.hasUnread && (
												<span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
											)}
										</div>
										<p className="truncate text-sm font-semibold mt-3">
											{request.firstName} {request.lastName}
											<span className="ml-1.5 font-normal text-muted-foreground">
												{request.user?.email ?? request.customerEmail}
											</span>
										</p>
										<div className="mt-1.5 space-y-0.5">
											{request.routes.map((route, i) => (
												<p
													key={i}
													className="flex items-center gap-1 truncate text-xs text-muted-foreground"
												>
													{route.pickup}{" "}
													<MoveRight className="h-3 w-3 shrink-0" />{" "}
													{route.destination}
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
								{isFetchingNextPage ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									t("loadMore")
								)}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
